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


@lru_cache()
def request_json(request, force=False, raise_error=True):
    if not (force or request.is_json()):
        return None

    try:
        result = json.loads(request.body)
    except Exception as e:
        if not raise_error:
            result = None
        else:
            raise e
    return result


HttpRequest.json = property(lambda self: request_json(self, force=True, raise_error=False))
HttpRequest.is_json = is_json


class JSONMixin:
    """
    A mixin that can be used to render a JSON response.
    """

    def render_to_json_response(self, data, safe=False, **response_kwargs):
        """
        Returns a JSON response.
        """
        return JsonResponse(data, safe=safe, **response_kwargs)

    @lru_cache()
    def json(self, force=False, raise_error=True):
        """Parse and return the data as JSON. If the mimetype does not
        indicate JSON (:mimetype:`application/json`, see
        :meth:`is_json`), this returns ``None`` unless ``force`` is
        true. If parsing fails, :meth:`on_json_loading_failed` is called
        and its return value is used as the return value.
        :param force: Ignore the mimetype and always try to parse JSON.
        :param raise_error: Set True to raise error or set False to return ``None``
            instead.
        """
        request = self.request
        if not (force or self.is_json()):
            return None

        try:
            result = json.loads(request.body)
        except Exception as e:
            if not raise_error:
                result = None
            else:
                raise e
        return result

    def is_json(self):
        """Check if the mimetype indicates JSON data, either
        :mimetype:`application/json` or :mimetype:`application/*+json`.
        """
        ct = self.request.content_type
        return (
            ct == 'application/json'
            or (ct.startswith('application/')) and ct.endswith('+json')
        )

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
