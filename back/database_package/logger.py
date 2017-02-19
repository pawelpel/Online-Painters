import getpass
import time
from datetime import datetime


class LoggerSingleton:
    _instance = None

    def __new__(cls, *args, **kwargs):
        """
            Overload how the objects are created,
            limit all of them to one instance.
        """
        if not isinstance(cls._instance, cls):
            cls._instance = object.__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self):
        """
            Add everything to one logger file,
            can be changed to log into multiple ones.
        """
        self.logger = "db_logger.log"

    def log_saving(self, json):
        with open(self._instance.logger, "a") as f:
            f.write(
                get_time() + "\nAdded to json collection:\n" + str(json)[:100] + '...' +
                "\nby user: " + getpass.getuser() + "\n\n"
            )

    def log_reading(self):
        with open(self._instance.logger, "a") as f:
            f.write(
                get_time() + "\nUser: " + getpass.getuser() +
                " read the whole json collection\n\n"
            )

    def log_clear(self, json_collection):
        with open(self._instance.logger, "a") as f:
            f.write(
                get_time() + "\nUser: " + getpass.getuser() +
                " cleared the whole json collection \nLast known collection:" +
                str(json_collection)[:100] + '...' + "\n\n"
            )


def get_time():
    """
        Simple function to determine timestamp of an action.
    """
    return datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S')
