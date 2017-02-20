import simplejson
import time
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
            Adds json list to database, with timestamp.
        """
        data = simplejson.loads(json)
        data['_time'] = int(time.time())
        self.logger.log_saving(json)
        self.json_collection.insert(data)

    def read_all(self):
        """
            Returns list of json.
        """
        def is_data(i):
            """
                It checks if given key is different than added by system
            """
            keys = ['_id', '_time']
            return all(i != k for k in keys)

        self.logger.log_reading()
        return simplejson.dumps([{i: x[i] for i in x if is_data(i)} for x in self.json_collection.find()])

    def clear(self):
        """
            Removes all documents and lists from json collection.
        """
        self.logger.log_clear(list(self.json_collection.find()))
        self.json_collection.remove()

    def remove_old(self, delay):
        """
            Removes data which się older than time delta.
        """
        self.logger.log_deleting_old(delay)
        self.json_collection.delete_many({'_time': {"$lt": int(time.time()) - int(delay)}})
