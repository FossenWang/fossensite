from multiprocessing.managers import BaseManager
from . import deployment


class TaskManager(BaseManager):
    pass


def task_test(text):
    print(text)
    return f'success:{text}'


manager = BaseManager(address=('', 5000), authkey=b'fossen')


if __name__ == "__main__":
    manager.register('deployment', callable=deployment.main)
    manager.register('test', callable=task_test)
    server = manager.get_server()
    server.serve_forever()
else:
    manager.register('deployment')
    manager.register('test')
