from selenium.webdriver import Firefox
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.proxy import Proxy, ProxyType
from selenium.webdriver.support.ui import WebDriverWait
import os
import requests
import unittest
import datetime
from pprint import pprint
import time
from collections import OrderedDict

TIMEOUT = 6

class Browser:
    def api_request(self, url, proxy, headers=''):
        try:    
            if proxy != '' and headers == '':
                http = "http://" + proxy['ip'] + ':' + proxy['port']
                https = "https://" + proxy['ip'] + ':' + proxy['port']
                proxydict = {'http': http, 'https': https}
                response = requests.get(url, timeout=TIMEOUT, proxies=proxydict)
            elif headers == '' and proxy == '':
                response = requests.get(url, timeout=TIMEOUT)
            elif headers != '' and proxy != '':
                http = "http://" + proxy['ip'] + ':' + proxy['port']
                https = "https://" + proxy['ip'] + ':' + proxy['port']
                proxydict = {'http': http, 'https': https}
                response = requests.get(url, timeout=TIMEOUT, proxies=proxydict, headers=headers)
            
            if response.ok and response != type(None):
                return response
            else:
                raise ConnectionError('status_code not 200')
        except requests.exceptions.RequestException as e:
            raise ConnectionError
    
    def api_request_with_session(self, url, givenSession, headers):
        try: 
            response = givenSession.get(url, timeout=TIMEOUT, headers=headers)
            if response.ok and response != type(None):
                return response
            else:
                raise ConnectionError('status code not 200')
        except requests.exceptions.RequestException as e:
            raise ConnectionError
class Selenium():
    dir = os.path.dirname(__file__)
    fireFoxDriverPath = os.path.join(dir,'drivers','geckodriver.exe')
    def __init__(self):
        self.opts = Options()
        self.profile = webdriver.FirefoxProfile()
        #  self.opts.set_headless(True)
        #  assert self.opts.headless # Operating in headless mode
   
    def Get_Options(self):
        return self.opts

    def Set_Options(self, options):
        self.opts = options

    def Set_Proxy(self, proxyHost, proxyPort):
        # Direct = 0, Manual = 1, PAC = 2, AUTODETECT = 4, SYSTEM = 5
        self.profile.set_preference("network.proxy.type", 1)
        self.profile.set_preference("network.proxy.http",proxyHost)
        self.profile.set_preference("network.proxy.http_port",int(proxyPort))
        self.profile.set_preference("general.useragent.override","whater_useragent")
        self.profile.update_preferences()

    def start(self):
        self.browser = Firefox(firefox_profile=self.profile, options=self.opts,
        executable_path=self.fireFoxDriverPath)
        self.browser.set_page_load_timeout(TIMEOUT)
    
    def Get_Page(self, url):
        self.browser.get(url)

    def Get_Page_Async(self):
         wait = WebDriverWait(self.browser, 30)
         self.browser.get("https://www.nutritionix.com/brands/grocery")
         self.browser.find_element_by_id("submitJquery").click()
         print( "Button is clicked at time: " + str(datetime.datetime.now().strftime("%Y%m%d%H%M%S")))
         wait.until(lambda browser: self.browser.execute_script("return jQuery.active == 0"))
         print ("Ajax request is completed at time: " + str(datetime.datetime.now().strftime("%Y%m%d%H%M%S")))






http_proxy  = "http://24.172.34.114:46341"
https_proxy = "http://24.172.34.114:46341"

proxyDict = { 
              "http"  : http_proxy, 
              "https" : https_proxy
            }


