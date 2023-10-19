def parse_label(label):
    print('label: {label}'.format(label=str(label)))


def parse_id(id):
    print('id: {id}'.format(id=str(id)))


def foo(name, *args):
    assert len(args) % 2 == 0
    for i in range(0, len(args)):
        if i % 2 == 0:
            parse_id(args[i])
        else:
            parse_label(args[i])


myargs = []
myargs.append('john')
myargs.append(1)
myargs.append('pen')
myargs.append(2)
myargs.append('towel')
foo(*myargs)
