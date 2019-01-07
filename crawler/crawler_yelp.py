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
from bson.objectid import ObjectId

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
                url = url + str(obj[part[1:]])
            else:
                url = url + part
        return url

    def GetWrite_One(self, coordsObj, url, headers, times = 0):
        try:
            global successes
            global failures

            getResult = driver.api_request_with_session(url, self.session, headers)
            self.totalTime = self.totalTime + getResult.elapsed.seconds

            jsonObj =  json.loads(getResult.content)
            
            #check if 0 results
            if 'noResultsSuggestions' in jsonObj['searchPageProps']['searchResultsProps']:
                print('no results')
                dbGps.Update_One({'_id': coordsObj['_id']}, {'$set': {'isFinished': True}})
                dbGps.Update_One({'_id': coordsObj['_id']}, {'$set': {'lastUpdate': time.time()}})
                return False #exit crawling gps coords
        
            for item in jsonObj['searchPageProps']['searchResultsProps']['searchResults']:
               item['loc'] =  jsonObj['searchPageProps']['searchMapProps']['mapState']['markers'][i]['location']
                
            writeResult = dbGps.Update({'_id': coordsObj['_id']}, {'$addToSet': {'items': {'$each': jsonObj['searchPageProps']['searchResultsProps']['searchResults']} }})

            with threadLock:
                self.success = self.success + 1
                successes = successes + 1

            self.proxy = proxySystem.Update_Proxy_Stats(self.proxy, getResult.elapsed.seconds)
            
            if len(jsonObj['searchPageProps']['searchResultsProps']['searchResults']) < 30:
                print("finished")
                dbGps.Update_One({'_id': coordsObj['_id']}, {'$set': {'isFinished': True}})
                dbGps.Update_One({'_id': coordsObj['_id']}, {'$set': {'lastUpdate': time.time()}})
                return False
            else:
                return True

        except Exception as e:
            with threadLock:
                self.failure = self.failure + 1
                failures = failures + 1
            self._fix_proxy()
            return self.GetWrite_One(coordsObj, url, headers, times+1)


    def Get_All(self, coordsObj, urlParts, headers):
            url = self.__gen_url(coordsObj['coords'], urlParts)
            numItems = len(coordsObj['items'])
            if numItems < 30:
                result = self.GetWrite_One(coordsObj, (url + "&request_origin=user"), headers)
            else:
                result = True
            while result:
                numItems = numItems + 30
                result = self.GetWrite_One(coordsObj, (url + "&start=" + str(numItems) + "&request_origin=user"), headers)

               # time.sleep(random.randint(1,2)) &start=30
    def getAvgTime(self):
        return self.totalTime / self.success

# https://www.yelp.com/search?find_desc=&l=g%3A-122.40626836663546%2C37.7923363916078%2C-122.45742345696749%2C37.75162923470684           
# requesturl https://www.yelp.com/search/snippet?find_desc=Restaurants
# &l=g%3A-86.7274475098%2C33.4348794896%2C-86.6251373291%2C33.5207890536&parent_request_id=9c2473a25cc25cc5&request_origin=user
# first coords top right, 2nd coords bottom left
def crawl_coords(coordsObj):
    #setup

    ua = UserAgent()
    sessionHeader = OrderedDict({ "accept": '*/*, text/plain, */*', 'accept-encoding': 'gzip, deflate, br', 'accept-language': 'en-US,en;q=0.9',
     'referer': 'https://www.yelp.com', 'user-agent': ua.random})
    
    with threadLock:
        proxy = proxySystem.Get_Proxy()
    work = Get_Data(sessionHeader, proxy)
    #time.sleep(random.randint(1,120))

    work.Get_All(coordsObj, ("https://www.yelp.com/search/snippet?find_desc=Restaurants&l=g%3A","$topRightLon","%2C", "$topRightLat", "%2C", "$botLeftLon", "%2C", "$botLeftLat"), 
    {'referer': 'https://www.yelp.com'})
    
    proxySystem.Return_Proxy(proxy, work.getAvgTime(), True )

    # update db

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
        crawl_coords(item)
        q.task_done()

def inactive_work():
    ua = UserAgent()
    while True:
        sessionHeader = OrderedDict({'referer': 'https://www.google.com', 'user-agent': ua.random})
        inActiveProxy = proxySystem.Get_Inactive_Proxy()
        proxySystem.Test_Proxy(inActiveProxy, sessionHeader)

#globals
num_worker_threads = 20
successes = 0
failures = 1

driver = Browser()
proxySystem = Proxy_System(num_worker_threads)
proxySystem.Add_New_Proxies('https://www.sslproxies.org/')
db_monitor = DataStore('localhost', 27017, 'proxies', 'monitor')

dbGps = DataStore('localhost', 27017,'yelp','coords')

threadLock = threading.Lock()



q = Queue()

coordsQuery = dbGps.Find_Many({'isFinished': False})
if coordsQuery == None:
    raise Exception("Coords Query did not find a valid coordsQuery Obj")

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

for item in coordsQuery:
    q.put(item)


q.join()       # block until all tasks are done
l.join()
m.join()
