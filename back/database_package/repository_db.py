import simplejson
from pymongo import MongoClient

from .logger import LoggerSingleton


class RepositoryDB:
    def __init__(self, database_name, collection_name):
        # connect to database
        self.client = MongoClient()
        # retrieve proper collection with specified name
        self.json_collection = self.client[database_name][collection_name]
        # create logger instance
        self.logger = LoggerSingleton()

    def append(self, json):
        """
            Adds json list to database.
        """
        data = simplejson.loads(json)
        self.logger.log_saving(json)
        self.json_collection.insert(data)

    def read_all(self):
        """
            Returns list of json.
        """
        self.logger.log_reading()
        return simplejson.dumps([{i: x[i] for i in x if i != '_id'} for x in self.json_collection.find()])

    def clear(self):
        """
            Removes all documents and lists from json collection.
        """
        self.logger.log_clear(list(self.json_collection.find()))
        self.json_collection.remove()
