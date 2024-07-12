import time
import random
from multiprocessing import Pool, freeze_support
import requests
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
from db import DataStore
from avl import AVLTree
import re
import json
ua = UserAgent()


def test():
    print('blah')
class ProxyGrabber: 
    def __init__(self, useragents_file=None):
        self.successWaitTime = 20
        self.failureWaitTime = 60
        self.user_ip = self.get_ip()
        self.proxyDb = DataStore('localhost', 27017,'proxies','proxies')
        self.proxy_list = AVLTree()
        self.checked_proxies = AVLTree()

    def _build_proxy_obj(self, ip, port):
        return {'ip': ip, 'port': port, 'successes': 0, 'failures': 0, 'online': True, 'inUse': False, 'avgReqTime': 0}

    def _proxy_key(self, proxy):
        return proxy['ip'] + proxy['port']

    def add_proxies_from_db(self):
        proxy_list = self.proxyDb.Find_Many({})
        for proxy in proxy_list:
            self.proxy_list.insert(self._proxy_key(proxy), proxy)

    def add_proxies(self, proxies):
        for proxy in proxies:
            self.proxy_list.insert(self._proxy_key(proxy), proxy)

    def get_useragent(self):
        return {'user-agent': ua.random}

    def get_proxy_list(self):
        proxy_list = self.proxy_list.as_list()
        return proxy_list

    def get_all_checked_proxies(self):
        proxy_list = self.checked_proxies.as_list()
        return proxy_list

    def get_proxy(self):
        return self.checked_proxies.pop_random()

    def get_ip(self, proxies={}):
        return requests.get(url='http://ip-api.com/json', proxies=proxies).json()['query']

    def load(self):
        self.load_proxies()

    def load_proxies(self):
        proxies = self.proxyDb.Find_Many({'waitTil': {'$lt':time.time()}})
        for proxy in proxies:
            self.proxy_list.insert(self._proxy_key(proxy), proxy)

    def save_proxy(self, proxy):
        self.proxyDb.Update_One({'ip': proxy['ip'], 'port': proxy['port']}, proxy, True)

    def save_proxies(self):
        proxy_list = self.checked_proxies.as_list()
        for proxy in proxy_list:
            self.save_proxy(proxy)

    def merge_new_proxies(self, proxy_list):
        proxies = self.proxyDb.Find_Many({})
        tree = AVLTree()

        for proxy in proxies:
                tree.insert(proxy['ip'] + proxy['port'], proxy)

        for proxy in proxy_list:
                tree.insert(proxy['ip'] + proxy['port'], proxy)
        print('duplicates: ', tree.getDuplicates())
        print('newProxies: ', len(proxy_list) - tree.getDuplicates())
        docs = tree.as_list()
        newDocs = []
        for idx, doc in enumerate(docs):
                if '_id' in doc:
                        pass
                else:
                        newDocs.append(doc)
        print('yay')
        self.proxyDb.Insert_Many(newDocs)

    def insert_proxies(self, proxies):
        for proxy in proxies:
             self.save_proxy(proxy)

    def grab_proxies(self, proxy_limit=None):
        _proxy_list = AVLTree()
        returnList = []
        proxy_sources = [
            "https://free-proxy-list.net/",
            "http://www.megaproxylist.net/",
            "https://www.us-proxy.org/",
            "https://www.sslproxies.org/",
            "https://proxyranker.com/china/list/",
        ]

        for url in proxy_sources:
            tmplist = self.universalProxyCrawl(url)
            for proxy in tmplist:
                _proxy_list.insert(proxy['ip'] + proxy['port'], proxy)
        returnList = _proxy_list.as_list(0)
        return returnList


    def check_proxies(self):
        list_proxy = self.get_proxy_list()
        if __name__ == '__main__':
            freeze_support()
            with Pool(20) as p:
                proxy_list = p.map(self.check_proxy, list_proxy)
            
        checked_proxy_list = []
        
        for elem in proxy_list:
            if elem:
                checked_proxy_list.append(elem)

        for proxy in checked_proxy_list:
            self.checked_proxies.insert(self._proxy_key(proxy), proxy)

    def check_proxy(self):
        pass

    def universalProxyCrawl(self, target_url):
            result = requests.get(target_url, headers=self.get_useragent())
            ipPattern = re.compile(r"^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$")
            portPattern = re.compile(r"^()([1-9]|[1-5]?[0-9]{2,4}|6[1-4][0-9]{3}|65[1-4][0-9]{2}|655[1-2][0-9]|6553[1-5])$")
            ipAndPortPattern = re.compile(r"^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(:)()([1-9]|[1-5]?[0-9]{2,4}|6[1-4][0-9]{3}|65[1-4][0-9]{2}|655[1-2][0-9]|6553[1-5])$")
            soup = BeautifulSoup(result.text, "lxml")
            pars_result = soup.find_all('tr')
            proxy_list = []
            for td in pars_result:
                    elems = td.find_all('td')
                    ip = ''
                    port = ''
                    for elem in elems:
                            elem = elem.get_text().strip()
                            if ipAndPortPattern.match(elem):
                                    elem = elem.split(':')
                                    ip = elem[0]
                                    port = elem[1]
                                    break
                            if ipPattern.match(elem):
                                    ip = elem
                            if portPattern.match(elem):
                                    port = elem
                                    break
                    if ip != '' and port != '':
                            proxy_list.append(self._build_proxy_obj(ip, port)) 
            return proxy_list
def check_proxy(proxy):
        proxyUrl = 'http://' + proxy['ip'] + ':' + proxy['port']
        time.sleep(1)
        try:
            result = requests.get('http://ip-api.com/json', proxies={'http': proxyUrl}, timeout=2)
            if result.status_code == 200:
                try:
                    if result.json()['status'] == 'success':
                        return proxy
                except (IndexError, json.decoder.JSONDecodeError):
                    return False
            else:
                return False
        except requests.exceptions.ConnectionError:
            return False
        except requests.exceptions.ReadTimeout:
            return False
        except requests.exceptions.ChunkedEncodingError:
            return False
        except requests.exceptions.TooManyRedirects:
            return False


if __name__ == '__main__':
    freeze_support()

    test = ProxyGrabber()
    test.add_proxies_from_db()

    list_proxy = test.get_proxy_list()

    print(len(list_proxy))
    with Pool(100) as p:
        proxy_list = p.map(check_proxy, list_proxy) 
    finalList = []
    for proxy in proxy_list:
        if proxy != False:
            finalList.append(proxy)

    db = DataStore('localhost', 27017,'proxies','fresh')
    db.Insert_Many(finalList)

    print(len(finalList))
