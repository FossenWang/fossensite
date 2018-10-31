from django.views import View
from django.http import HttpResponse, JsonResponse

from .manager import TaskManager

class JSONMixin:
    """
    A mixin that can be used to render a JSON response.
    """

    def render_to_json_response(self, data, safe=False, **response_kwargs):
        """
        Returns a JSON response.
        """
        return JsonResponse(data, safe=safe, **response_kwargs)

    # def get_data(self):
    #     """
    #     Returns an object that will be serialized as JSON by json.dumps().
    #     """
    #     raise NotImplementedError('You need to implement this method.')


class JSONView(JSONMixin, View):
    def dispatch(self, request, *args, **kwargs):
        try:
            response = super().dispatch(request, *args, **kwargs)
            if not isinstance(response, HttpResponse):
                response = self.render_to_json_response(response)
        except Exception as e:
            raise e
        return response


class DeploymentWebhook(JSONView):
    def post(self, request):
        print(request.POST, request.body)
        manager = TaskManager(address=('127.0.0.1', 5000), authkey=b'fossen')
        manager.register('test')
        manager.connect()
        r = manager.test('xxxxx')
        return {'msg': r.format()}

    def get(self, request):
        return self.post(request)
