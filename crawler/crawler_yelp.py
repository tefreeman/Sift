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

    def GetWrite_One(self, url, headers, times = 0):
        try:
            global successes
            global failures

            getResult = driver.api_request_with_session(url, self.session, headers)
            self.totalTime = self.totalTime + getResult.elapsed.seconds

            objToWrite =  json.loads(brotli.decompress(getResult.content))
            if(objToWrite['searchPageProps']['searchExceptionProps']['exceptionType'] == "excessivePaging"):
                return False

            writeResult = db.Insert_Many(objToWrite)

            with threadLock:
                self.success = self.success + 1
                successes = successes + 1

            self.proxy = proxySystem.Update_Proxy_Stats(self.proxy, getResult.elapsed.seconds)
            return True
        except Exception as e:
            with threadLock:
                self.failure = self.failure + 1
                failures = failures + 1
            self._fix_proxy()
            return self.GetWrite_One(url, headers, times+1)


    def Get_All(self, obj, urlParts, headers):
            url = self.__gen_url(obj, urlParts)
            result = self.GetWrite_One(obj, (url), headers)
            while result:
                 result = self.GetWrite_One(obj, (url), headers)
            

               # time.sleep(random.randint(1,2))
    def getAvgTime(self):
        return self.totalTime / self.success

# https://www.yelp.com/search?find_desc=&l=g%3A-122.40626836663546%2C37.7923363916078%2C-122.45742345696749%2C37.75162923470684           
# requesturl https://www.yelp.com/search/snippet?find_desc=Restaurants
# &l=g%3A-86.7274475098%2C33.4348794896%2C-86.6251373291%2C33.5207890536&parent_request_id=9c2473a25cc25cc5&request_origin=user
# first coords top right, 2nd coords bottom left
def crawl_brand(brandObj):
    #setup
    ua = UserAgent()
    sessionHeader = OrderedDict({ "accept": '*/*, text/plain, */*', 'accept-encoding': 'gzip, deflate, br', 'accept-language': 'en-US,en;q=0.9',
     'referer': 'https://www.yelp.com', 'user-agent': ua.random})
    
    with threadLock:
        proxy = proxySystem.Get_Proxy()
    work = Get_Data(sessionHeader, proxy)
    #time.sleep(random.randint(1,120))
    
    #change coords query here
    coordsObj = dbGps.Find_One({'_id': '5c3299aa15c5f431acf40e2e'})

    work.Get_All(coordsObj['coords'], ("requesturl https://www.yelp.com/search/snippet?find_desc=Restaurants&l=g%3A","$topRightLat","%2C", "topRightLon", "%2C", "botLeftLat", "%2C", "$botLeftLon"), 
    {'referer': 'https://www.yelp.com'})
    
    proxySystem.Return_Proxy(proxy, work.getAvgTime(), True )

    dbGps.Update_One({'_id': brandObj['_id']}, {'$set': {'isFinished': True}})

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
db = DataStore('localhost', 27017,'yelp','items')
db_monitor = DataStore('localhost', 27017, 'proxies', 'monitor')
dbGps = DataStore('localhost', 27017,'yelp','coords')
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
