from proxy import Proxy_System
from web_data import Browser
from db import DataStore
from queue import Queue
from threading import Thread
import time
import json

driver = Browser()
proxySystem = Proxy_System()
db = DataStore('localhost', 27017,'nutritionix','grocery')

BrandsList = db.Find_Many({'isFinished': False})
num_worker_threads = 1


def crawl_brand(brandObj):
    groceryItemListUrl = "https://www.nutritionix.com/nixapi/brands/" + brandObj['id'] + "/items/1?limit=1000&search="
    proxyHost = proxySystem.Get_Proxy()
    start_time = time.time()

    getResult = driver.api_request(groceryItemListUrl, proxyHost)
   
    timeTook = time.time() - start_time
    content = getResult['response']

    if getResult['success'] == True:
        proxySystem.Return_Proxy(proxyHost, timeTook, True)
        data = content.json()
        
        for item in data['items']:
             proxyHost = proxySystem.Get_Proxy()
             itemName = item['item_name'].replace(" ", "-")
             itemId = item['item_id']
             groceryProductUrl = "https://www.nutritionix.com/i/" + itemName + "/" + itemId
             start_time = time.time()
             productResult = driver.api_request(groceryProductUrl, proxyHost)
             timeTook = time.time() - start_time
             if productResult['success'] == True:
                  proxySystem.Return_Proxy(proxyHost, timeTook, True)
                  productData = productResult['response'].json()
                  print(productData)
    else:
         pass
def worker():
    while True:
        item = q.get()
        crawl_brand(item)
        q.task_done()

q = Queue()
for i in range(num_worker_threads):
     t = Thread(target=worker)
     t.daemon = True
     t.start()

for item in BrandsList:
    q.put(item)

q.join()       # block until all tasks are done

# Grocery Product List: https://www.nutritionix.com/nixapi/brands/51db37b0176fe9790a8983c1/items/1?limit=1000&search=

#groceryItemListUrl = "https://www.nutritionix.com/nixapi/brands/" + brandId + "/items/1?limit=1000&search="

# Grocery Product: https://www.nutritionix.com/i/air-heads/artificially-flavored-candy/545ce645d43cefdf6dbf8021

#groceryProductUrl = "https://www.nutritionix.com/i/" + productName + "/" + productId