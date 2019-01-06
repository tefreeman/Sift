from db import DataStore

largestName = 0
name = ""
db2 = DataStore('localhost', 27017,'nutritionix','restaurants')
restaurants = db2.Find_Many({}, 1000000)

for place in restaurants:
    for item in place['items']:
        nameSize = len(item['item_name'])
        if (nameSize > largestName):
                largestName = nameSize
                name = item['item_name']
print(largestName)
print(name)