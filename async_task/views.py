from django.views import View
from django.http import HttpResponse, JsonResponse

from .manager import TaskManager

class JSONMixin:
    """
    A mixin that can be used to render a JSON response.
    """

    def render_to_json_response(self, data, **response_kwargs):
        """
        Returns a JSON response.
        """
        return JsonResponse(data, **response_kwargs)

    # def get_data(self):
    #     """
    #     Returns an object that will be serialized as JSON by json.dumps().
    #     """
    #     raise NotImplementedError('You need to implement this method.')


class JSONView(JSONMixin, View):
    def dispatch(self, request, *args, **kwargs):
        response = super().dispatch(request, *args, **kwargs)
        if not isinstance(response, HttpResponse):
            self.render_to_json_response(response)
        return response


class DeploymentWebhook(JSONView):
    def post(self, request):
        test = TaskManager.test('test')
        print(test)
        return test
