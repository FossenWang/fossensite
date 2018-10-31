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


manager = TaskManager(address=('127.0.0.1', 5000), authkey=b'fossen')

manager.register('deploy', callable=deploy_task)
manager.register('test', callable=task_test)

# if __name__ == "__main__":
#     manager.register('deploy', callable=deployment.main)
#     manager.register('test', callable=task_test)
#     server = manager.get_server()
#     server.serve_forever()
# else:
#     manager.register('deploy')
#     manager.register('test')
#     # manager.connect()
