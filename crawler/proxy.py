from web_data import Browser
from db import DataStore
import pymongo
import heapq
import json
import time
import requests
from pprint import pprint
from lxml import html
from functools import total_ordering
import sys
@total_ordering
class KeyDict(object):
    def __init__(self, key, dct):
        self.key = key
        self.dct = dct

    def __lt__(self, other):
        return self.key < other.key

    def __eq__(self, other):
        return self.key == other.key

    def __repr__(self):
        return '{0.__class__.__name__}(key={0.key}, dct={0.dct})'.format(self)

class Heap_Proxy:
    def __init__(self, limit):
        self.dataStore = DataStore('localhost', 27017,'proxies','proxies')
        self.active_proxy_heap = []
        self.inactive_proxy_heap = []
        self.limit = limit
        self.__Reset()
        self.__Load_Heap()
        self.isGetting = False
        self.timesRun = 0
        self.maxTimesRun = 400
    
    def __Gen_Speed(self, failures, successes, avgReqTime):
            return (failures + 1.0) / ( successes + 1.0) + avgReqTime
   
    def __Make_Sortable_Dict(self, obj):
        speed = self.__Gen_Speed(obj['failures'], obj['successes'], obj['avgRequestTime'])
        # (speed, obj['_id'], obj['ip'], obj['port'], obj['successes'], obj['failures'], obj['avgRequestTime'])
        result = KeyDict(speed, obj)
        return result

    def __Load_Heap(self, activeHeap = True, inactiveHeap = True):
        proxyList = self.dataStore.Find_Many({'inUse': False}, limitAmount=self.limit)
        if activeHeap and inactiveHeap:
            for doc in proxyList:
                self.__UpdateInUse(doc, True) # sets inUse in monogoDB to true
                if doc['online'] == True:
                    heapq.heappush(self.active_proxy_heap, self.__Make_Sortable_Dict(doc))
                else:          
                    heapq.heappush(self.inactive_proxy_heap, self.__Make_Sortable_Dict(doc))
        elif activeHeap:
            for doc in proxyList:
                if doc['inUse'] == False:
                    self.__UpdateInUse(doc, True) # sets inUse in monogoDB to true
                    heapq.heappush(self.active_proxy_heap, self.__Make_Sortable_Dict(doc))
        elif inactiveHeap:
            for doc in proxyList:
                if doc['inUse'] == False:
                    self.__UpdateInUse(doc, True) # sets inUse in monogoDB to true     
                    heapq.heappush(self.inactive_proxy_heap, self.__Make_Sortable_Dict(doc))


    
    def __UpdateInUse(self, proxy, inUseBool):
        self.dataStore.Update_One({"_id": proxy['_id']}, {'$set': {"inUse": inUseBool}})

    def __Already_Exists(self, ip, port):
        if self.dataStore.Find_One({'ip': ip, 'port': port}) == None:
            return False
        else:
            return True

    def Get(self, active = True):
        try:
            if self.timesRun >= self.maxTimesRun:
                self.isGetting = True
                self.timesRun = 0
                self.__Load_Heap(activeHeap=True, inactiveHeap=False)
                self.isGetting = False
            if active and len(self.active_proxy_heap) > 0:
                self.timesRun += 1
                return heapq.heappop(self.active_proxy_heap).dct
            elif active and len(self.active_proxy_heap) <= 0:
                if self.isGetting == False:
                    self.isGetting = True
                    self.__Load_Heap(activeHeap=True, inactiveHeap=False)
                    self.isGetting = False
                    return heapq.heappop(self.active_proxy_heap).dct
                else:
                    time.sleep(10)
                    return heapq.heappop(self.active_proxy_heap).dct
            elif active == False and len(self.inactive_proxy_heap) > 0:
                return heapq.heappop(self.inactive_proxy_heap).dct
            elif active == False and len(self.active_proxy_heap) == 0:
                self.__Load_Heap(activeHeap=False, inactiveHeap=True)
                return heapq.heappop(self.inactive_proxy_heap).dct
            else: 
                raise Exception('Proxy_System.Get() something terribly wrong happenend')
        except:
            time.sleep(10)
            return self.Get(active)
    
    def Return(self, proxy, isOnline):
        proxy['online'] = isOnline
        proxy['inUse'] = False
        self.dataStore.Replace_One({"_id": proxy['_id']}, proxy)
    
    def Add_New(self, hosts):
        host_list = list()
        for host in hosts:
            if self.__Already_Exists(host[0], host[1]):
                pass
            else:
                host_list.append({'ip': host[0], 'port': host[1], 'successes': 0,
                'failures': 0, 'avgRequestTime': 0, 'online': True, 'inUse': False})
        if len(host_list) > 0:
            print("Adding ", len(host_list), " proxies to database!")
            self.dataStore.Insert_Many(host_list)

    def __Reset(self):
         test = self.dataStore.Update_Many({ }, {'$set':{'inUse': False}} )
    

class Proxy_System:
    def __init__(self):
        self.proxies = Heap_Proxy(800)
        self.driver = Browser()
        self.testUrl = "https://www.nutritionix.com/nixapi/items/5593bf874d09368121149e81"
        self.count = 0
        self.maxLoadNew = 20000
        self.totalCount = 0
    
    def __calc_avg_time(self, proxy, timeTook):
        tlt = proxy['successes'] + proxy['failures']
        return ((tlt * proxy['avgRequestTime']) + timeTook) / (tlt + 1)

    def __time(self, func, params):
        start_time = time.time()
        funcReturn = {}
        funcReturn['res'] = func(*params)
        funcReturn['time'] = time.time() - start_time
        return funcReturn

    def __Test_Proxy(self , isActive):
        try:
            proxy = self.proxies.Get(isActive)
            if proxy != None:
                result = self.__time(self.driver.api_request, (self.testUrl, proxy) )
                proxy['avgRequestTime'] = result['time']
                proxy['successes'] = 1
                proxy['failures'] = 0
                self.proxies.Return(proxy, True)
                return True
            else:
                    return False
        except (ConnectionError, ConnectionRefusedError, TimeoutError, requests.exceptions.ProxyError
                , requests.exceptions.ConnectTimeout, requests.exceptions.SSLError, requests.exceptions.ReadTimeout,
                requests.exceptions.TooManyRedirects, requests.exceptions.HTTPError, requests.exceptions.ConnectionError, ):

                        proxy['avgRequestTime'] = self.__calc_avg_time(proxy, 8.0)
                        proxy['failures'] += 1
                        self.proxies.Return(proxy, False)
                        return True
        except:
            print('unknown error retrying')
            time.sleep(10)
            return self.__Test_Proxy(isActive)


    def Add_New_Proxies(self, url):
        try:
            page = self.driver.api_request(url, '')
            tree = html.fromstring(page.content)
            ip = tree.xpath('//*[@id="proxylisttable"]/tbody/tr/td[1]/text()')
            port = tree.xpath('//*[@id="proxylisttable"]/tbody/tr/td[2]/text()')
            self.proxies.Add_New(list(zip(ip, port)))
        except Exception as e:
            print(e)
    
    def Test_In_Active_Proxies(self):
        self.proxies._Heap_Proxy__Load_Heap(False, True)
        isNotEmpty = self.__Test_Proxy(False)
        while isNotEmpty:
            isNotEmpty = self.__Test_Proxy(False)

    def Test_Active_Proxies(self):
        isNotEmpty = self.__Test_Proxy(True)
        while isNotEmpty:
            isNotEmpty = self.__Test_Proxy(True)
        
    def Get_Proxy(self):
        self.count+= 1
        self.totalCount+= 1
        if self.count >= self.maxLoadNew:
            self.count = 0
            self.Add_New_Proxies('https://www.sslproxies.org/')
            print(self.totalCount, " items processed")



        proxy = self.proxies.Get()
        return proxy

    def Return_Proxy(self, proxy, timeTook, isOnline):
        proxy['avgRequestTime'] = self.__calc_avg_time(proxy, timeTook)
        if(isOnline):
            proxy['successes'] += 1
        else:
             proxy['failures'] += 1
        
        self.proxies.Return(proxy, isOnline)
    