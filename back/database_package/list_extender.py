import simplejson


class ListExtender(list):
    """
        Class extends list class with necessary methods.
    """
    def read_all(self):
        ret = simplejson.dumps([simplejson.loads(x) for x in self])
        return ret

    def remove_old(self, delay):
        pass
