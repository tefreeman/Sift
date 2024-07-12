import requests
import re
from bs4 import BeautifulSoup
import fake_useragent
import bleach
import avl
from db import DataStore
from multiprocessing import Pool, freeze_support

def f(x):
    return x*x

if __name__ == '__main__':
        freeze_support()
        p = Pool(16)
        print(p.map(f, [1, 2, 3]))