from multiprocessing import Process
from multiprocessing.managers import BaseManager
from . import deployment

class TaskManager(BaseManager):
    pass


def task_test(text):
    return f'success:{text}'


def deploy_task():
    p = Process(target=deployment.main)
    p.start()
    return 0


manager = TaskManager(address=('127.0.0.1', 8001), authkey=b'fossen')

manager.register('deploy', callable=deploy_task)
manager.register('test', callable=task_test)


def serve_forever():
    server = manager.get_server()
    print(f'Starting server at {manager.address[0]}:{manager.address[1]}')
    server.serve_forever()
