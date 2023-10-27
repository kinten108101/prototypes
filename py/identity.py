import inspect


def is_same_function(target, name, argc):
    if target.__name__ == name and len(inspect.getfullargspec(target).args) == argc:
        return True
    else:
        return False


class Hi:
    def foo(self, count, message):
        print('hi')


def connect(signal, callback):
    if signal == 'clicked':
        if is_same_function(callback, 'foo', 3):
            print('Yes')
            print(inspect.getargs(callback))


hi = Hi()
connect('clicked', hi.foo)