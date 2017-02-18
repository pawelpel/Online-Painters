from pymongo import MongoClient


class RepositoryDB:
    def __init__(self, database_name, collection_name):
        # connect to database
        self.client = MongoClient()
        # retrieve proper collection with specified name
        self.json_collection = self.client[database_name][collection_name]

    def append(self, json):
        """add json list to database
        raise assert exception in case of not being a list"""
        assert isinstance(json, dict)
        self.json_collection.insert(json)

    def read_all(self):
        return list(self.json_collection.find())

    def clear_all(self):
        """remove all documents and lists from json collection"""
        self.json_collection.remove()
