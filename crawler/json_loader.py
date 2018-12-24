from db import DataStore


db2 = DataStore('localhost', 27017,'proxies','proxies')
db2.Update_Many({}, {"$set": {'online': False, 'successes': 0, 'failures': 0, 'avgRequestTime': 0}})