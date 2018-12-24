from proxy import Proxy_System
from web_data import Browser
from db import DataStore
from queue import Queue
from threading import Thread
import threading
import datetime
import time
import json
import os
import requests
import itertools
import sys
from fake_useragent import UserAgent
from collections import OrderedDict
import gzip
import brotli
import random 
class Get_Data:
    def __init__(self, sessionHeaders, sessionProxy ):
        self.session = requests.Session()
        self.success = 1
        self.failure = 0
        self.session.headers = sessionHeaders
        self.proxy = sessionProxy
        self.session.proxies = {'http': "http://" + self.proxy['ip'] + ':' + self.proxy['port'], 'https': "https://" + self.proxy['ip'] + ':' + self.proxy['port']}
        self.totalTime = 0
        self.reqMinTime = 4

    def _fix_proxy(self):
       #print('success: ', self.success , ' and failure: ', self.failure)
        proxySystem.Return_Proxy(self.proxy, 8, False)
      #  time.sleep(random.randint(2,5))
        with threadLock:
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
                if _url == item['url']:
                    if _url in urlList:
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

            self.proxy = proxySystem.Update_Proxy_Stats(self.proxy, getResult.elapsed.seconds)

        except Exception as e:
            with threadLock:
                self.failure = self.failure + 1
                failures = failures + 1
            self._fix_proxy()
            return self.GetWrite_One(obj, urlParts, headers, times+1)

    def Get_One(self, obj, urlParts, headers, times = 0):
        global successes
        global failures
        try:
            url = self.__gen_url(obj, urlParts)
            getResult = driver.api_request_with_session(url, self.session, headers )
            self.totalTime = self.totalTime + getResult.elapsed.seconds
            return json.loads(brotli.decompress(getResult.content))
            with threadLock:
                self.success = self.success + 1
                successes = successes + 1
            self.proxy = proxySystem.Update_Proxy_Stats(self.proxy, getResult.elapsed.seconds)

        except Exception as e:
            with threadLock:
                self.failure = self.failure + 1
                failures = failures + 1
            self._fix_proxy()
            return self.Get_One(obj, urlParts, headers, times+1)

    def Get_All(self, brandObj, obj_list, urlParts, headers):
            url_list = self.__gen_urls_from_list(brandObj, obj_list, urlParts)
            for url in url_list:
                self.GetWrite_One(brandObj, (url), headers)
               # time.sleep(random.randint(1,2))
    def getAvgTime(self):
        return self.totalTime / self.success

                    


        
def crawl_brand(brandObj):
    #setup
    ua = UserAgent()
    sessionHeader = OrderedDict({ "accept": 'application/json, text/plain, */*', 'accept-encoding': 'gzip, deflate, br', 'accept-language': 'n-US,en;q=0.9',
     'referer': '$refererUrl', 'user-agent': ua.random})
    with threadLock:
        proxy = proxySystem.Get_Proxy()
    work = Get_Data(sessionHeader, proxy)
    #time.sleep(random.randint(1,120))
    brandItemDirectory = work.Get_One(brandObj, ("https://www.nutritionix.com/nixapi/brands/", '$id', '/items/1?limit=10000&search=',), {'referer': 'https://www.google.com'})
    work.Get_All(brandObj, brandItemDirectory['items'], ("https://www.nutritionix.com/nixapi/items/",  '$item_id'), 
    {'referer': 'https://www.nutritionix.com/brand/' + brandObj['name'].replace(' ', '-').lower() + '/products/' + brandObj['id']})
    
    proxySystem.Return_Proxy(proxy, work.getAvgTime(), True )
    MongoDbLength = len(db.Find_One({'_id': brandObj['_id']})['items'])
    if len(brandItemDirectory['items']) <= MongoDbLength:
        print('updated: ', MongoDbLength)
        brandObj['isFinished'] = True
        db.Update_One({'_id': brandObj['_id']}, {'$set': {'isFinished': True}})
    else:
        print("mongodb != len of items")
        raise Exception("MongoDb does not contain enough items")

def monitors():
    startTime = time.time()
    time.sleep(1)
    while True:
        global successes
        global failures
        reqPerSec = successes / (time.time() - startTime)
        print("Total Items: ", successes, " | Total Failures: ", failures, " | Items per second: ", reqPerSec)
        sys.stdout.flush()
        time.sleep(15)   
         
def worker():
    while True:
        item = q.get()
        crawl_brand(item)
        q.task_done()

def inactive_work():
    ua = UserAgent()
    while True:
        sessionHeader = OrderedDict({'referer': 'https://www.google.com', 'user-agent': ua.random})
        inActiveProxy = proxySystem.Get_Inactive_Proxy()
        proxySystem.Test_Proxy(inActiveProxy, sessionHeader)

#globals
num_worker_threads = 30
successes = 0
failures = 1

driver = Browser()
proxySystem = Proxy_System(num_worker_threads)
proxySystem.Add_New_Proxies('https://www.sslproxies.org/')
db = DataStore('localhost', 27017,'nutritionix','grocery')
db_monitor = DataStore('localhost', 27017, 'proxies', 'monitor')
threadLock = threading.Lock()
BrandsList = db.Find_Many({'isFinished': False})
print("current left ", len(BrandsList))



q = Queue()
time.sleep(1)

for i in range(0,20):
    l = Thread(target=inactive_work)
    l.daemon = True
    l.start()

m = Thread(target=monitors)
m.daemon = True
m.start()


for i in range(num_worker_threads):
    t = Thread(target=worker)
    t.daemon = True
    t.start()


for item in BrandsList:
    q.put(item)




q.join()       # block until all tasks are done
l.join()
m.join()
