import json
from functools import lru_cache

from django.views import View
from django.http import HttpRequest, HttpResponse, JsonResponse


def is_json(request):
    """Check if the mimetype indicates JSON data, either
    :mimetype:`application/json` or :mimetype:`application/*+json`.
    """
    ct = request.content_type
    return (
        ct == 'application/json'
        or (ct.startswith('application/')) and ct.endswith('+json')
    )


def get_json(request, force=False, raise_error=True):
    if not (force or request.is_json):
        return None

    try:
        result = json.loads(request.body)
    except Exception as e:
        if not raise_error:
            result = None
        else:
            raise e
    return result


def bind_json_to_request():
    HttpRequest.get_json = get_json
    HttpRequest.json = property(lambda self: get_json(self, raise_error=False))
    HttpRequest.is_json = property(is_json)


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
