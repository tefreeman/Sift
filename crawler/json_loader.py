from db import DataStore


db2 = DataStore('localhost', 27017,'nutritionix','grocery')
db2.Update_Many({}, {"$set": {'items': []}})