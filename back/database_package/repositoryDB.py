import simplejson
from pymongo import MongoClient


class RepositoryDB:
    def __init__(self, database_name, collection_name):
        # connect to database
        self.client = MongoClient()
        # retrieve proper collection with specified name
        self.json_collection = self.client[database_name][collection_name]

    def append(self, json):
        """
            Adds json list to database.
        """
        data = simplejson.loads(json)
        self.json_collection.insert(data)

    def read_all(self):
        """
            Returns list of json.
        """
        return simplejson.dumps([{i: x[i] for i in x if i != '_id'} for x in self.json_collection.find()])

    def clear(self):
        """
            Removes all documents and lists from json collection.
        """
        self.json_collection.remove()
