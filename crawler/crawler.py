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


class Get_Data:
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
                    urlList.remove(_url)           
        
        return urlList

    def GetWrite_One(self, obj, urlParts, times = 0):
        try:
            global successes
            global failures
            url = self.__gen_url(obj, urlParts)
            with threadLock:
                proxyHost = proxySystem.Get_Proxy()
            getResult = driver.api_request(url, proxyHost)
            timeTook = getResult.elapsed.seconds
            proxySystem.Return_Proxy(proxyHost, timeTook, True)
            objToWrite =  getResult.json()
            objToWrite['url'] = url
            objToWrite.pop('public_lists', None)
            writeResult = db.Update({'_id': obj['_id']}, {'$addToSet': {'items': objToWrite}})
            with threadLock:
                successes = successes + 1
        except Exception as e:
            with threadLock:
                failures = failures + 1
            proxySystem.Return_Proxy(proxyHost, 8, False)
            self.GetWrite_One(obj, urlParts, times+1)

    def Get_One(self, obj, urlParts, times = 0):
        global successes
        global failures
        try:
            url = self.__gen_url(obj, urlParts)
            with threadLock:
                proxyHost = proxySystem.Get_Proxy()
            getResult = driver.api_request(url, proxyHost)
            timeTook = getResult.elapsed.seconds
            proxySystem.Return_Proxy(proxyHost, timeTook, True)
            return  getResult.json()
            with threadLock:
                successes = successes + 1
        except Exception as e:
            with threadLock:
                failures = failures + 1
            proxySystem.Return_Proxy(proxyHost, 8, False)
            return self.Get_One(obj, urlParts, times+1)
           
    def Get_All(self, brandObj, obj_list, urlParts):
            url_list = self.__gen_urls_from_list(brandObj, obj_list, urlParts)
            #for url in url_list:
            self.GetWrite_One(brandObj, (url_list[0]))



        
def crawl_brand(brandObj):
    #setup
    work = Get_Data()
    brandItemDirectory = work.Get_One(brandObj, ("https://www.nutritionix.com/nixapi/brands/", '$id', '/items/1?limit=1000&search='))
    work.Get_All(brandObj, brandItemDirectory['items'], ("https://www.nutritionix.com/nixapi/items/",  '$item_id'))
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
num_worker_threads = 200


q = Queue()
for i in range(num_worker_threads):
    t = Thread(target=worker)
    t.daemon = True
    t.start()

def inactive_work():
    while True:
        inActiveProxy = proxySystem.Get_Inactive_Proxy()
        proxySystem.Test_Proxy(False, inActiveProxy)

for i in range(0,40):
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
