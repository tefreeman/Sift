from selenium.webdriver import Firefox
from selenium.webdriver.firefox.options import Options
import os
import requests



class EmulatedBrowser:
    dir = os.path.dirname(__file__)
    fireFoxDriverPath = os.path.join(dir,'drivers','geckodriver.exe')
    
    def __init__(self):
        self.opts = Options()
        self.opts.set_headless()
        assert self.opts.headless # Operating in headless mode
        self.browser = Firefox(options=self.opts, executable_path=self.fireFoxDriverPath)

    def WGet_Page(self, url):
        response = requests.get(url)
        print(response.text)


test = EmulatedBrowser()
test.WGet_Page("https://www.nutritionix.com/nixapi/items/51d2fdd7cc9bff111580ecf3")
