from pymongo import MongoClient

class DataStore:
    def __init__(self, url, port, database, collection=''):
        self.client = MongoClient(url, port)
        self.db = self.client[database]
        if collection != '':
            self.collection = self.db[collection]
    
    def Set_Collection(self, name):

        self.collection = self.db[name]
    
    def Insert_One(self, doc):
        try:
            id = self.collection.insert_one(doc)
            return id.inserted_id
        except:
            return 0

    def Insert_Many(self, docs):
        try:
            ids = self.collection.insert_many(docs)
            return ids.inserted_ids
        except:
            return 0
    
    def Find_One(self, conditions):
        try:
            doc =  self.collection.find_one(conditions)
            return doc
        except:
            return 0

    def Find(self, conditions):
        try:
            doc =  self.collection.find(conditions)
            return doc
        except:
            return
    
    def Find_Many(self, conditions, limitAmount=1000):
        try:
            c = self.collection.find(conditions).limit(limitAmount)
            return list(c)
        except:
            return 0

    def Update_One(self, condition, u_Condition):
        try: 
            updateResult = self.collection.update_one(condition, u_Condition)
            return updateResult
        except:
            return 0

    def Update_Many(self, condition, u_condition):
        try:
            updateResult = self.collection.update_many(condition, u_condition)
            return updateResult
        except:
            return 0

 
    def Replace_One(self, condition, r_condition, _upsert):
        try:
            replaceResult = self.collection.replace_one(condition, r_condition, upsert=_upsert)
            return replaceResult
        except:
            return 0
 
    def Delete_One(self, condition):
        try:
            delResult = self.collection.delete_one(condition)
            return delResult
        except:
            return 0

    def Delete_Many(self, condition):
        try: 
            delResults = self.collection.delete_many(condition)
            return delResults
        except:
            return 0

    def Aggregate(self, condition):
        self.collection.aggregate(condition)

