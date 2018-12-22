from proxy import Proxy_System
from web_data import Browser
from db import DataStore
from queue import Queue
from threading import Thread
import time
import json
import requests
class Get_Data:

    def __time_took(self, func, params):
        start_time = time.time()
        funcReturn = {}
        funcReturn['return'] = func(*params)
        funcReturn['time'] = time.time() - start_time
        return funcReturn

    def __gen_url(self, obj, urlParts): #urlParts = ("https://www.nutritionix.com/nixapi/brands/", '$id', '/items/1?limit=1000&search=')
        url = ""
        for part in urlParts:
            if part[0] == '$':
                url = url + obj[part[1:]]
            else:
                url = url + part
        return url
    
    def __gen_urls_from_list(self, obj_list, urlParts):
        for obj in obj_list:
            url = ""
            for part in urlParts:
                if part[0] == '$':
                    url = url + obj[part[1:]]
                else:
                    url = url + part
            obj['url'] = url
        return obj_list

    def GetWrite_One(self, obj, urlParts, times = 0):
        if times >= 20:
            print("GetWrite_One fatal error tried 20 times and failed")
        try:
            url = self.__gen_url(obj, urlParts)
            proxyHost = proxySystem.Get_Proxy()
            getResult = self.__time_took(driver.api_request, (url, proxyHost))
            proxySystem.Return_Proxy(proxyHost, getResult['time'], True)
            objToWrite =  getResult['return'].json()
            objToWrite['url'] = url
            objToWrite.pop('public_lists', None)
            writeResult = db.Update({'_id': obj['_id']}, {'$addToSet': {'items': objToWrite}})
            if times >= 20:
                print("resolved timeout 20 times +")
        except Exception as e:
            if times >= 20:
                print(e)
            proxySystem.Return_Proxy(proxyHost, 8, False)
            self.GetWrite_One(obj, urlParts, times+1)

    def Get_One(self, obj, urlParts, times = 0):
        if times >= 20:
            print("Get_One fatal error tried 20 times and failed")
        try:
            url = self.__gen_url(obj, urlParts)
            proxyHost = proxySystem.Get_Proxy()
            getResult = self.__time_took(driver.api_request, (url, proxyHost))
            proxySystem.Return_Proxy(proxyHost, getResult['time'], True)
            return  getResult['return'].json()
        except Exception as e:
                proxySystem.Return_Proxy(proxyHost, 8, False)
                return self.Get_One(obj, urlParts, times+1)
           

    def Get_All(self, brandObj, obj_list, urlParts):
            obj_list = self.__gen_urls_from_list(obj_list, urlParts)
            for obj in obj_list:
                self.GetWrite_One(brandObj, (obj['url']))




        
def crawl_brand(brandObj):
    #setup
    
    work = Get_Data()
    brandItemDirectory = work.Get_One(brandObj, ("https://www.nutritionix.com/nixapi/brands/", '$id', '/items/1?limit=1000&search='))
    work.Get_All(brandObj, brandItemDirectory['items'], ("https://www.nutritionix.com/nixapi/items/",  '$item_id'))
        
    if len(brandItemDirectory['items']) == len(db.Find_One({'_id': brandObj['_id']})['items']):
        brandObj['isFinished'] = True
        db.Update_One({'_id': brandObj['_id']}, {'$set': {'isFinished': True}})
    else:
        print("fatal Error")
        pass
    
         
def worker():
    while True:
        item = q.get()
        crawl_brand(item)
        q.task_done()


driver = Browser()
proxySystem = Proxy_System()
proxySystem.Add_New_Proxies('https://www.sslproxies.org/')
db = DataStore('localhost', 27017,'nutritionix','grocery')

BrandsList = db.Find_Many({'isFinished': False})
print("current left ", len(BrandsList))
num_worker_threads = 100


q = Queue()
for i in range(num_worker_threads):
    t = Thread(target=worker)
    t.daemon = True
    t.start()


l = Thread(target=proxySystem.Test_In_Active_Proxies)
l.daemon = True
l.start()

for item in BrandsList:
    q.put(item)

q.join()       # block until all tasks are done
l.join()
