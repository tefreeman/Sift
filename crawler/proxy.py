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
        self.__Load_Heap()
    
    def __Gen_Speed(self, failures, successes):
        return (failures + 1.0) / ( successes + 1.0)
   
    def __Make_Sortable_Dict(self, obj):
        speed = self.__Gen_Speed(obj['failures'], obj['successes'])
        # (speed, obj['_id'], obj['ip'], obj['port'], obj['successes'], obj['failures'], obj['avgRequestTime'])
        result = KeyDict(speed, obj)
        return result

    def __Load_Heap(self):
        proxyList = self.dataStore.Find_Many({}, limitAmount=self.limit)
        for doc in proxyList:
            if doc['inUse'] == False:
               # self.__UpdateInUse(doc, True) # sets inUse in monogoDB to true
                if doc['online'] == True:
                    heapq.heappush(self.active_proxy_heap, self.__Make_Sortable_Dict(doc))
                else:          
                    heapq.heappush(self.inactive_proxy_heap, self.__Make_Sortable_Dict(doc))
            else:
                print("in use")
    
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
            elif active == False and len(self.inactive_proxy_heap) > 0:
                return heapq.heappop(self.inactive_proxy_heap).dct
            else:
                return None
        except:
            print("error at Get(self)")
            return None
    
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

        print("Adding ", len(host_list), " proxies to database!")
        self.dataStore.Insert_Many(host_list)
    

class Proxy_System:
    def __init__(self):
        self.proxies = Heap_Proxy(1000)
        self.driver = Browser()
        self.testUrl = "https://www.nutritionix.com/"
    
    def __calc_avg_time(self, proxy, timeTook):
        tlt = proxy['successes'] + proxy['failures']
        return ((tlt * proxy['avgRequestTime']) + timeTook) / (tlt + 1)

    def __time(self, func, params):
        start_time = time.time()
        funcReturn = func(*params)
        funcReturn['time'] = time.time() - start_time
        return funcReturn

    def __Test_Proxy(self , isActive):
        proxy = self.proxies.Get(isActive)
        if proxy != None:
            proxyUrl = 'http://' + proxy['ip'] + ':' + proxy['port']
            result = self.__time(self.driver.api_request, (self.testUrl, proxyUrl) )

            if result['success']:
                proxy['avgRequestTime'] = self.__calc_avg_time(proxy, result['time'])
                proxy['successes'] += 1
                self.proxies.Return(proxy, True)
            else:
                proxy['avgRequestTime'] = self.__calc_avg_time(proxy, result['time'])
                proxy['failures'] += 1
                self.proxies.Return(proxy, False)
            
            return True
        else:
            return False

    def Add_New_Proxies(self, url):
        try:
            page = self.driver.api_request(url, '')['response']
            tree = html.fromstring(page.content)
            ip = tree.xpath('//*[@id="proxylisttable"]/tbody/tr/td[1]/text()')
            port = tree.xpath('//*[@id="proxylisttable"]/tbody/tr/td[2]/text()')
            self.proxies.Add_New(list(zip(ip, port)))
        except:
            print("error Add Host To Database")
    
    def Test_In_Acive_Proxies(self):
        isNotEmpty = self.__Test_Proxy(False)
        while isNotEmpty:
            isNotEmpty = self.__Test_Proxy(False)

    def Test_Active_Proxies(self):
        isNotEmpty = self.__Test_Proxy(True)
        while isNotEmpty:
            isNotEmpty = self.__Test_Proxy(True)
        
    def Get_Proxy(self):
        proxy = self.proxies.Get()
        return proxy

    def Return_Proxy(self, proxy, timeTook, isOnline):
        proxy['avgRequestTime'] = self.__calc_avg_time(proxy, timeTook)
        if(isOnline):
            proxy['successes'] += 1
        else:
             proxy['failures'] += 1
        
        self.proxies.Return(proxy, isOnline)