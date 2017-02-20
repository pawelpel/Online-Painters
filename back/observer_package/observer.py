import random


class Observable(object):
    """
        Observable class to handle sending data to connected clients.

        Has a list (self.observers) of connected clients (list of WSHandler). When new client append
        he gets message with all existing data form database. When any client send something
        it will be sent to all connected clients.
    """

    def __init__(self, database=None, extended_list=None, verbose=False, remove_time_delay=None):
        self.observers = []
        self.verbose = verbose
        self.remove_time_delay = remove_time_delay

        if database:
            self.database_initialized = True
            self.database = database
            self.database.clear()
        else:
            self.database_initialized = False
            self.database = extended_list

    def in_observers(self, observer):
        """
            Returns True if observer is in observers list.
        """
        if observer in self.observers:
            return True

    def add_observer(self, observer):
        """
            Method appends observer to observers list. Then notify him with all existing data from database.
        """
        self.observers.append(observer)

        message = self.database.read_all()

        if message:
            print('Notifing new client!')
            self.show_message(message, True)
            self.notify(observer, message)

        self.show_status()

    def delete_observer(self, observer):
        """
            Method deletes observer from observers list. Then delete observer object.
        """
        try:
            self.observers.remove(observer)
            del observer
            self.show_status()
        except ValueError:
            pass

    def get_observer_no(self):
        """
            Returns length of observers list.
        """
        return len(self.observers)

    def show_status(self):
        """
            Method prints observable class status.
        """
        print('Observable: I have {} observers'.format(self.get_observer_no()))

    def show_message(self, message, new_client=False):
        if self.verbose:
            t_1 = ''
            t_2 = 'S'
            if new_client:
                t_1 = 'NEW '
                t_2 = ''
            print("MESSAGE SENT TO {}CLIENT{}: ".format(t_1, t_2), message)

    @staticmethod
    def notify(observer, message):
        """
            Method executes observer notify method for given observer with given message.
        """
        observer.notify(message)

    def notify_all(self, message):
        """
            Method add new message to database and then executes observable notify method for all observers
            from observers list with passing given message.
        """
        if self.remove_time_delay:
            self.database.remove_old(self.remove_time_delay)
        self.database.append(message)
        self.show_message(message)

        for observer in self.observers:
            self.notify(observer, message)


class Observer:
    """
        Observer class represents each client.
    """
    def __init__(self, user):
        self.user = user
        self.name = 'Client_'+''.join(str(random.randint(0, 10)) for _ in range(5))

    def notify(self, message):
        """
            Method sends given message to client.
        """
        self.user.write_message(message)
