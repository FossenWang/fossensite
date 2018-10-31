from async_task.manager import manager

server = manager.get_server()
print('start serve')
server.serve_forever()
