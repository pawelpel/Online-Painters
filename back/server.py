import os
import sqlite3

import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web


class Observable:
    def __init__(self):
        self.observers = []

    def in_observers(self, observer):
        if observer in self.observers:
            return True

    def add_observer(self, observer):
        self.observers.append(observer)
        self.show_status()

    def delete_observer(self, observer):
        self.observers.remove(observer)
        del observer
        self.show_status()

    def show_status(self):
        print('Observable: I have {} observers'.format(len(self.observers)))

    def notify(self, message):
        for observer in self.observers:
            observer.notify(message)


class Observer:
    def __init__(self, user):
        self.user = user

    def notify(self, message):
        self.user.write_message(message)


class IndexHandler(tornado.web.RequestHandler):
    def __init__(self, *args, front_path, **kwargs):
        super().__init__(*args, **kwargs)
        self.front_path = front_path

    def data_received(self, chunk):
        pass

    def get(self):
        self.render(self.front_path+"index.html")


class WSHandler(tornado.websocket.WebSocketHandler):
    def __init__(self, *args, observable, **kwargs):
        super().__init__(*args, **kwargs)
        self.observable = observable
        self.observer = None

    def data_received(self, chunk):
        pass

    def open(self):
        print('Opening a new connection!')
        self.observer = Observer(self)

        if not self.observable.in_observers(self.observer):
            self.observable.add_observer(self.observer)

    def on_message(self, message):
        print('Received: {}'.format(message))
        self.observable.notify(message)

    def on_close(self):
        print('Closing connection!')
        self.observable.delete_observer(self.observer)

    def check_origin(self, origin):
        return True


def run_server(port=None):

    front_path = os.path.dirname(os.getcwd()) + '/py-js-Studia_online_painters/front/'

    # conn = sqlite3.connect('data_base.db')

    observable = Observable()

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
