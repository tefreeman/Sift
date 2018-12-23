from proxy import Proxy_System
from web_data import Browser
from db import DataStore
from queue import Queue
from threading import Thread
import threading
import datetime
import time
import json
import requests
import itertools
import sys
from fake_useragent import UserAgent
from collections import OrderedDict
import gzip
import brotli
class Get_Data:
    def __init__(self, sessionHeaders, sessionProxy ):
        self.session = requests.Session()
        self.success = 1
        self.failure = 0
        self.session.headers = sessionHeaders
        self.proxy = sessionProxy
        self.session.proxies = {'http': "http://" + self.proxy['ip'] + ':' + self.proxy['port'], 'https': "https://" + self.proxy['ip'] + ':' + self.proxy['port']}
        self.totalTime = 0

    def _fix_proxy(self):
        proxySystem.Return_Proxy(self.proxy, self.totalTime / self.success+1, False)
        self.proxy = proxySystem.Get_Proxy()
        self.session.proxies = {'http': "http://" + self.proxy['ip'] + ':' + self.proxy['port'], 'https': "https://" + self.proxy['ip'] + ':' + self.proxy['port']}
    
    def __gen_url(self, obj, urlParts): #urlParts = ("https://www.nutritionix.com/nixapi/brands/", '$id', '/items/1?limit=1000&search=')
        url = ""
        for part in urlParts:
            if part[0] == '$':
                url = url + obj[part[1:]]
            else:
                url = url + part
        return url
    
    def __gen_urls_from_list(self, brandObj, obj_list, urlParts):
        urlList = list()
        items = db.Find_One({'id': brandObj['id']})['items']
        for obj in obj_list:
            url = ""
            for part in urlParts:
                if part[0] == '$':
                    url = url + obj[part[1:]]
                else:
                    url = url + part
            urlList.append(url)
            
        for _url in urlList:
            for item in items:
                if _url[0] == item['url']:
                    urlList.remove(_url)           
        
        return urlList

    def GetWrite_One(self, obj, urlParts, headers, times = 0):
        try:
            global successes
            global failures
            url = self.__gen_url(obj, urlParts)
            getResult = driver.api_request_with_session(url, self.session, headers)
            self.totalTime = self.totalTime + getResult.elapsed.seconds
            objToWrite =  json.loads(brotli.decompress(getResult.content))
            objToWrite['url'] = url
            objToWrite.pop('public_lists', None)
            writeResult = db.Update({'_id': obj['_id']}, {'$addToSet': {'items': objToWrite}})
            with threadLock:
                self.success = self.success + 1
                successes = successes + 1

        except Exception as e:
            with threadLock:
                self.failure = self.failure + 1
                failures = failures + 1
            
            self._fix_proxy()
            self.GetWrite_One(obj, urlParts, headers, times+1)

    def Get_One(self, obj, urlParts, headers, times = 0):
        global successes
        global failures
        try:
            url = self.__gen_url(obj, urlParts)
            getResult = driver.api_request_with_session(url, self.session, headers )
            self.totalTime = 0
            return json.loads(brotli.decompress(getResult.content))
            with threadLock:
                self.success = self.success + 1
                successes = successes + 1

        except Exception as e:
            print(e)
            with threadLock:
                self.failure = self.failure + 1
                failures = failures + 1
            self._fix_proxy()
            return self.Get_One(obj, urlParts, headers, times+1)

    def Get_All(self, brandObj, obj_list, urlParts, headers):
            url_list = self.__gen_urls_from_list(brandObj, obj_list, urlParts)
            for url in url_list:
                self.GetWrite_One(brandObj, (url), headers)



        
def crawl_brand(brandObj):
    #setup
    ua = UserAgent()
    sessionHeader = OrderedDict({ "accept": 'application/json, text/plain, */*', 'accept-encoding': 'gzip, deflate, br', 'accept-language': 'n-US,en;q=0.9',
     'referer': '$refererUrl', 'user-agent': ua.random})
    work = Get_Data(sessionHeader, proxySystem.Get_Proxy())

    brandItemDirectory = work.Get_One(brandObj, ("https://www.nutritionix.com/nixapi/brands/", '$id', '/items/1?limit=1000&search=',), {'referer': 'https://www.google.com'})
    work.Get_All(brandObj, brandItemDirectory['items'], ("https://www.nutritionix.com/nixapi/items/",  '$item_id'), 
    {'referer': 'https://www.nutritionix.com/brand/' + brandObj['name'].replace(' ', '-').lower() + '/products/' + brandObj['id']})
    
    
    MongoDbLength = len(db.Find_One({'_id': brandObj['_id']})['items'])
    if len(brandItemDirectory['items']) <= MongoDbLength:
        brandObj['isFinished'] = True
        db.Update_One({'_id': brandObj['_id']}, {'$set': {'isFinished': True}})
    else:
        pass

def monitors():
    oldSuccesses = 0
    startTime = time.time()
    time.sleep(1)
    while True:
        global successes
        global failures
        reqPerSec = successes / (time.time() - startTime)
        print("Total Items: ", successes, " | Total Failures: ", failures, " | Items per second: ", reqPerSec, end='\r')
        oldSuccesses = successes
        sys.stdout.flush()
        time.sleep(1)   
         
def worker():
    while True:
        item = q.get()
        crawl_brand(item)
        q.task_done()


successes = 0
failures = 1

driver = Browser()
proxySystem = Proxy_System()
proxySystem.Add_New_Proxies('https://www.sslproxies.org/')
db = DataStore('localhost', 27017,'nutritionix','grocery')
db_monitor = DataStore('localhost', 27017, 'proxies', 'monitor')
threadLock = threading.Lock()
BrandsList = db.Find_Many({'isFinished': False})
print("current left ", len(BrandsList))
num_worker_threads = 10


q = Queue()
for i in range(num_worker_threads):
    t = Thread(target=worker)
    t.daemon = True
    t.start()

def inactive_work():
    while True:
        inActiveProxy = proxySystem.Get_Inactive_Proxy()
        proxySystem.Test_Proxy(False, inActiveProxy)

for i in range(0,1):
    l = Thread(target=inactive_work)
    l.daemon = True
    l.start()

m = Thread(target=monitors)
m.daemon = True
m.start()

for item in BrandsList:
    q.put(item)

q.join()       # block until all tasks are done
l.join()
m.join()
