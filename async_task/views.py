from tools.views import JSONView

from .manager import TaskManager


class DeploymentWebhook(JSONView):
    def post(self, request):
        from pprint import pprint
        import json
        pprint(request.POST.dict())
        pprint(json.loads(request.body))
        # manager = TaskManager(address=('127.0.0.1', 5000), authkey=b'fossen')
        # manager.register('test')
        # manager.connect()
        # r = manager.test('xxxxx')
        return '' #{'msg': r.format()}

    def get(self, request):
        return self.post(request)
