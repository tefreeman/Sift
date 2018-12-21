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
        url_list = []
        for obj in obj_list:
            url = ""
            for part in urlParts:
                if part[0] == '$':
                    url = url + obj[part[1:]]
                else:
                    url = url + part
            url_list.append(url)
        return url_list

    def Get_One(self, obj, urlParts):
            url = self.__gen_url(obj, urlParts)
            proxyHost = proxySystem.Get_Proxy()
            try:
                getResult = self.__time_took(driver.api_request, (url, proxyHost))
                proxySystem.Return_Proxy(proxyHost, getResult['time'], True)
                return getResult['return'].json()
            
            except (ConnectionError, ConnectionRefusedError, TimeoutError, requests.exceptions.ProxyError
            , requests.exceptions.ConnectTimeout, requests.exceptions.SSLError, requests.exceptions.ReadTimeout,
             requests.exceptions.TooManyRedirects, requests.exceptions.HTTPError, requests.exceptions.ConnectionError):
                proxySystem.Return_Proxy(proxyHost, 15, False)
                return self.Get_One(obj, urlParts)


    def Get_All(self, obj_list, urlParts):
            url_list = self.__gen_urls_from_list(obj_list, urlParts)
            response_list = []
            for url in url_list:
               response_list.append(self.Get_One({}, (url)))
            return response_list




        
def crawl_brand(brandObj):
    #setup
    
    work = Get_Data()
    brandItemDirectory = work.Get_One(brandObj, ("https://www.nutritionix.com/nixapi/brands/", '$id', '/items/1?limit=1000&search='))
    brandItems = work.Get_All(brandItemDirectory['items'], ("https://www.nutritionix.com/nixapi/items/",  '$item_id'))

    brandObj['items'] = brandItems
        
    if len(brandItemDirectory['items']) == len(brandObj['items']):
        brandObj['isFinished'] = True
        db.Replace_One({'_id': brandObj['_id']}, brandObj)
    else:
         pass
    
         
def worker():
    while True:
        item = q.get()
        crawl_brand(item)
        q.task_done()

while True:
    try:
        driver = Browser()
        proxySystem = Proxy_System()
        proxySystem.Add_New_Proxies('https://www.sslproxies.org/')
        db = DataStore('localhost', 27017,'nutritionix','grocery')

        BrandsList = db.Find_Many({'isFinished': False})
        num_worker_threads = 50


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
    except:
        pass
    print("Main exception occured restarting main thread")
    time.sleep(15)
