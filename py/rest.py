def foo():
    return [1, 2, 3]


class A:
    def __init__(self):
        self.a, self.b, self.c, *self.d = foo()


a = A()
print(a.d)