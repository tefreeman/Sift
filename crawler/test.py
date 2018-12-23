from db import DataStore

db = DataStore('68.185.251.95', 27017,'nutritionix','grocery')

test = db.Find_One({"id": "51db37ca176fe9790a8997a5"})
count = 0
testList = []
for item in test['items']:
    if item['item_name'] == 'Noodle Bowl, Soy Ginger':
        testList.append(item)
print(testList[0])