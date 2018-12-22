from pymongo import MongoClient

class DataStore:
    def __init__(self, url, port, database, collection=''):
        self.client = MongoClient(url, port, username="***REMOVED***", password="***REMOVED***")
        self.db = self.client[database]
        if collection != '':
            self.collection = self.db[collection]
    
    def Set_Collection(self, name):

        self.collection = self.db[name]
    
    def Insert_One(self, doc):
            id = self.collection.insert_one(doc)
            return id.inserted_id

    def Insert_Many(self, docs):

            ids = self.collection.insert_many(docs)
            return ids.inserted_ids
    
    def Find_One(self, conditions):

            doc =  self.collection.find_one(conditions)
            return doc

    def Find(self, conditions):
            doc =  self.collection.find(conditions)
            return doc
    
    def Find_Many(self, conditions, limitAmount=100000):
            c = self.collection.find(conditions).limit(limitAmount)
            return list(c)

    def Update_One(self, condition, u_Condition):
            updateResult = self.collection.update_one(condition, u_Condition)
            return updateResult

    def Update_Many(self, condition, u_condition):

            updateResult = self.collection.update_many(condition, u_condition)
            return updateResult
   
    def Update(self, condition, u_condition):

            updateResult = self.collection.update(condition, u_condition)
            return updateResult

 
    def Replace_One(self, condition, r_condition):
            replaceResult = self.collection.replace_one(condition, r_condition)
            return replaceResult

 
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
        return self.collection.aggregate(condition)

