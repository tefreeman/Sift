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
    

    def __Make_Sortable_Dict(self, obj):
        speed = obj['avgRequestTime']
        # (speed, obj['_id'], obj['ip'], obj['port'], obj['successes'], obj['failures'], obj['avgRequestTime'])
        result = KeyDict(speed, obj)
        return result

    def __Load_Heap(self, activeHeap = True, inactiveHeap = True):
        proxyList = self.dataStore.Find_Many({'inUse': False}, limitAmount=self.limit)
        if activeHeap and inactiveHeap:
            self.active_proxy_heap = []
            self.inactive_proxy_heap = []
            for doc in proxyList:
                self.__UpdateInUse(doc, True) # sets inUse in monogoDB to true
                if doc['online'] == True:
                    heapq.heappush(self.active_proxy_heap, self.__Make_Sortable_Dict(doc))
                else:          
                    heapq.heappush(self.inactive_proxy_heap, self.__Make_Sortable_Dict(doc))
        elif activeHeap:
            self.active_proxy_heap = []
            for doc in proxyList:
                if doc['inUse'] == False:
                    self.__UpdateInUse(doc, True) # sets inUse in monogoDB to true
                    heapq.heappush(self.active_proxy_heap, self.__Make_Sortable_Dict(doc))
        elif inactiveHeap:
            self.inactive_proxy_heap = []
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
            if active and len(self.active_proxy_heap) > 0:
                return heapq.heappop(self.active_proxy_heap).dct
            elif active and len(self.active_proxy_heap) <= 0:
                    self.__Load_Heap(activeHeap=True, inactiveHeap=False)
                    return heapq.heappop(self.active_proxy_heap).dct
            elif active == False and len(self.inactive_proxy_heap) > 0:
                return heapq.heappop(self.inactive_proxy_heap).dct
            elif active == False and len(self.active_proxy_heap) <= 0:
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
    
    def Update(self, proxy):
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
    def __init__(self, heapProxyGetSize):
        self.proxies = Heap_Proxy(heapProxyGetSize*5)
        self.driver = Browser()
        self.testUrl = "https://www.google.com/"
        self.count = 0
        self.maxLoadNew = 10000
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

    def Test_Proxy(self , proxy, headers):
        try:
                result = self.driver.api_request(self.testUrl, proxy, headers=headers)
                proxy['avgRequestTime'] = result.elapsed.seconds
                proxy['successes'] = proxy['successes'] + 1
                self.proxies.Return(proxy, True)
                return True
        except (ConnectionError, ConnectionRefusedError, TimeoutError, requests.exceptions.ProxyError
                , requests.exceptions.ConnectTimeout, requests.exceptions.SSLError, requests.exceptions.ReadTimeout,
                requests.exceptions.TooManyRedirects, requests.exceptions.HTTPError, requests.exceptions.ConnectionError, ):
                        proxy['failures'] += 1
                        self.proxies.Return(proxy, False)
        except Exception as e:
            print(e)
            print('unknown Test_Proxy error retrying')
            proxy['failures'] += 1
            self.proxies.Return(proxy, False)


    def Add_New_Proxies(self, url):
        try:
            page = self.driver.api_request(url, '')
            tree = html.fromstring(page.content)
            ip = tree.xpath('//*[@id="proxylisttable"]/tbody/tr/td[1]/text()')
            port = tree.xpath('//*[@id="proxylisttable"]/tbody/tr/td[2]/text()')
            self.proxies.Add_New(list(zip(ip, port)))
        except Exception as e:
            print(e)
            
    def Get_Inactive_Proxy(self):
        proxy = self.proxies.Get(False)
        return proxy

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

    def Update_Proxy_Stats(self, proxy, timeTook):
        proxy['avgRequestTime'] = self.__calc_avg_time(proxy, timeTook)
        proxy['successes'] += 1
        self.proxies.Update(proxy)
        return proxy
    