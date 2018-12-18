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
TIMEOUT = 20

class Browser:
    
    def api_request(self, method, url, proxy):
        try:
            if proxy != '':
                response = requests.request(method, url, timeout=TIMEOUT, proxies=proxy)
            else:
                response = requests.request(method, url, timeout=TIMEOUT)
            return (True, response)
        except TimeoutError:
            print("TimeOutError")
            return (False, response)
        except:
            print("Unknown Error")
            return (False, response)

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


