from django.http import HttpResponseForbidden
from django.views.decorators.csrf import csrf_exempt

from tools.views import JSONView

from .manager import TaskManager


class DeploymentWebhook(JSONView):
    def post(self, request):
        data = self.get_data()
        if not isinstance(data, dict):
            return HttpResponseForbidden('format error')

        ref = data.get('ref', None)  # type: str
        if isinstance(ref, str) and ref.endswith('/master'):
            self.deploy()
        else:
            return 'ignore'
        return 'success'

    def deploy(self):
        manager = TaskManager(address=('127.0.0.1', 8001), authkey=b'fossen')
        manager.register('deploy')
        manager.connect()
        r = manager.deploy()
        return str(r)


deploy_view = csrf_exempt(DeploymentWebhook.as_view())
