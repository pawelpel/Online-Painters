import os
import sys
import datetime
import random
import simplejson

import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web

from database_package import RepositoryDB


class ListExtender(list):
    """
        Class extends list class with read_all method
    """
    def read_all(self):
        ret = simplejson.dumps([simplejson.loads(x) for x in self])
        return ret


class Observable(object):
    """
        Observable class to handle sending data to connected clients.

        Has a list (self.observers) of connected clients (list of WSHandler). When new client append
        he gets message with all existing data form database. When any client send something
        it will be sent to all connected clients.
    """

    def __init__(self, database=None):
        self.observers = []

        if database:
            self.database_initialized = True
            self.database = database
            self.database.clear()
        else:
            self.database_initialized = False
            self.database = ListExtender()

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
        # print('\tMessages:\n['+'\n '.join(self.database).strip()+']')

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
        self.database.append(message)

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


class IndexHandler(tornado.web.RequestHandler):
    """
        Class represents main page.
    """
    def __init__(self, *args, front_path, **kwargs):
        super().__init__(*args, **kwargs)
        self.front_path = front_path

    def data_received(self, chunk):
        pass

    def get(self):
        """
            Renders main page on GET request.
        """
        self.render(self.front_path+"index.html")


class WSHandler(tornado.websocket.WebSocketHandler):
    """
        Class represents websocket connection.
    """
    def __init__(self, *args, observable, **kwargs):
        super().__init__(*args, **kwargs)
        self.observable = observable
        self.observer = None

    def data_received(self, chunk):
        pass

    def open(self):
        """
            Method creates new observer object on new connection event.
        """
        self.observer = Observer(self)
        self.log_event('Opening a new connection!')

        if not self.observable.in_observers(self.observer):
            self.observable.add_observer(self.observer)

    def on_message(self, message):
        """
            Method executes observable notify_all method when new message came from client.
        """
        self.log_event('Received: {}'.format(message))
        self.observable.notify_all(message)

    def on_close(self):
        """
            Method execute observalbe delet_observer method on connection close event.
        """
        self.log_event('Closing connection!')
        self.observable.delete_observer(self.observer)

    def check_origin(self, origin):
        return True

    def log_event(self, message):
        """
            Method print time, observer name and given message.
        """
        who = ' '*5
        if self.observer is not None:
            who = self.observer.name
        print("{}-{}: {}".format(datetime.datetime.now().strftime("%Y-%m-%d %H:%M"), who, message))


def run_server(port=None):
    """
        Main function with run server on localhost and given port.
    """

    # Path to front-end files
    front_path = os.path.dirname(os.getcwd()) + '/py-js-Studia_online_painters/front/'

    if any(argv == 'no_db' for argv in sys.argv):
        print('Using LIST')
        database = None
    else:
        print('Using DATABASE')
        database = RepositoryDB('painter_db', 'collection_db')

    if any(argv == 'test' for argv in sys.argv):
        print('Using TEST_FRONT')
        front_path += 'test_front/'

    observable = Observable(database=database)

    application = tornado.web.Application([
        (r'/ws', WSHandler, dict(observable=observable)),
        (r'/', IndexHandler, dict(front_path=front_path)),
        (r'/(.*)', tornado.web.StaticFileHandler, {'path': front_path})
    ])

    http_server = tornado.httpserver.HTTPServer(application)

    if port is None:
        port = 8888

    http_server.listen(port)
    print('Running...')
    tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    try:
        run_server(8000)
    except KeyboardInterrupt as e:
        pass
