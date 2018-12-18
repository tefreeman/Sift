from web_data import Browser
from db import DataStore
import pymongo
import heapq
import json
import time
from pprint import pprint
from lxml import html
class Heap_Proxy:
    def __init__(self, limit):
        self.dataStore = DataStore('localhost', 27017,'proxies','proxies')
        self.active_proxy_heap = []
        self.inactive_proxy_heap = []
        self.limit = limit
        self.__Load_Heap()
    
    def __Gen_Speed(self, failures, successes):
        return (failures + 1.0) / ( successes + 1.0)
   
    def __Make_Tuple(self, obj):
        speed = self.__Gen_Speed(obj['failures'], obj['successes'])
        result = (speed, obj['_id'], obj['ip'], obj['port'], obj['successes'], obj['failures'])
        return result

    def __Load_Heap(self):
        proxyList = self.dataStore.Find_Many({}, limitAmount=self.limit)
        for doc in proxyList:
            if doc['inUse'] == False:
                self.__UpdateInUse(doc, True) # sets inUse in monogoDB to true
                if doc['online'] == True:
                    heapq.heappush(self.active_proxy_heap, self.__Make_Tuple(doc))
                else:          
                    heapq.heappush(self.inactive_proxy_heap, self.__Make_Tuple(doc))
    
    def __UpdateInUse(self, proxy, inUseBool):
        self.dataStore.Update_One({"_id": proxy['_id']}, {'$set': {"inUse": inUseBool}})

    def __Already_Exists(self, ip, port):
        if self.dataStore.Find_One({'ip': ip, 'port': port}) == None:
            return False
        else:
            return True

    def Get(self):
        return heapq.heappop(self.active_proxy_heap)
    
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
                'failures': 0, 'success_time': 0, 'online': True, 'inUse': False})

        print("Adding ", len(host_list), " proxies to database!")
        self.dataStore.Insert_Many(host_list)
    
    def Exit(self):
       self.dataStore.Update_Many({}, {'$set': {"inUse": False}})
            


class Proxy_System:
    def __init__(self):
        self.proxies = Heap_Proxy(1000)
        self.driver = Browser()
        self.testUrl = "http://www.google.com"
    
    def __time(self, func, params):
        start_time = time.time()
        funcReturn = func(*params)
        return (time.time() - start_time, funcReturn)

    def Add_Hosts_To_Database(self, url):
         page = self.driver.api_request('GET', url, '')[1]
         tree = html.fromstring(page.content)
         ip = tree.xpath('//*[@id="proxylisttable"]/tbody/tr/td[1]/text()')
         port = tree.xpath('//*[@id="proxylisttable"]/tbody/tr/td[2]/text()')


         self.proxies.Add_New(list(zip(ip, port)))

    def Test_Proxies(self):
        proxy = self.proxies.Get()
        proxyUrl = 'http://' + proxy['ip'] + ':' + proxy['port']
        result = self.__time(self.driver.api_request, ('GET', self.testUrl, proxyUrl ))
        print(result[0])
        print(result[1])

    def Exit(self):
        self.proxies.Exit()

test = Proxy_System()
#test.Add_Hosts_To_Database("https://sslproxies.org")
test.Exit()
test.Test_Proxies()

#test.Add_Hosts_To_Database("https://www.sslproxies.org/")