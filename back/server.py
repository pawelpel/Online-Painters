import datetime
import os
import sys

import tornado.httpserver
import tornado.ioloop
import tornado.web
import tornado.websocket

from database_package.repository_db import RepositoryDB
from database_package.list_extender import ListExtender
from observer_package.observer import Observer, Observable


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
        self.log_event('Received message')
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
        Main function which run server on localhost and given port.
    """

    # Path to front-end files
    path = os.path.dirname(os.getcwd()) + '/py-js-Studia_online_painters/'
    front_path = path + 'front/'

    if any(argv == 'verbose' for argv in sys.argv):
        print('Using VERBOSE mode')
        verbose = True
    else:
        verbose = False

    if any(argv == 'remove_delay' for argv in sys.argv):
        print('Using VERBOSE mode')
        remove_time_delay = 10
    else:
        remove_time_delay = None

    if any(argv == 'no_db' for argv in sys.argv):
        print('Using LIST')
        database = None
        extended_list = ListExtender()
    else:
        print('Using DATABASE')
        database = RepositoryDB('painter_db', 'collection_db')
        extended_list = None

    if any(argv == 'test' for argv in sys.argv):
        print('Using TEST_FRONT')
        front_path += 'test_front/'

    observable = Observable(database=database,
                            verbose=verbose,
                            extended_list=extended_list,
                            remove_time_delay=remove_time_delay)

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
