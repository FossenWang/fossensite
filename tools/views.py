import json

from django.views import View
from django.views.generic.base import TemplateResponseMixin
from django.views.generic.detail import SingleObjectMixin
from django.views.generic.list import MultipleObjectMixin
from django.http import HttpRequest, HttpResponse, JsonResponse, Http404


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

    def get_data(self):
        """
        Returns an object that will be serialized as JSON by json.dumps().
        """
        if getattr(self.request, 'is_json', None):
            data = getattr(self.request, 'json', None)
        else:
            data = self.request.POST
        return data


class JSONView(JSONMixin, View):
    def handle404(self, error):
        return JsonResponse({'msg': str(error)}, status=404)

    def dispatch(self, request: HttpRequest, *args, **kwargs):
        try:
            response = super().dispatch(request, *args, **kwargs)
            if not isinstance(response, HttpResponse):
                response = self.render_to_json_response(response)
        except Http404 as e:
            return self.handle404(e)
        except Exception as e:
            raise e
        return response


class TemplateJSONView(JSONMixin, TemplateResponseMixin, View):
    json_only = False

    def handle404(self, error):
        return JsonResponse({'msg': str(error)}, status=404)

    def dispatch(self, request: HttpRequest, *args, **kwargs):
        try:
            response = super().dispatch(request, *args, **kwargs)
            if not isinstance(response, HttpResponse):
                if not self.json_only and request.method == 'GET' \
                   and 'json' not in request.META.get('HTTP_ACCEPT', ''):
                    # when request uses GET method and dosen't accept json response
                    # response should be render to TemplateResponse
                    response = self.render_to_response(response)
                else:
                    response = self.render_to_json_response(response)
        except Http404 as e:
            return self.handle404(e)
        except Exception as e:
            raise e
        return response


class ListView(MultipleObjectMixin, TemplateJSONView):
    def get(self, request, **kwargs):
        self.object_list = self.get_queryset()
        self.context = self.get_context_data()
        data = self.serialize()
        if self.paginate_by and 'pageInfo' not in data:
            data['pageInfo'] = self.get_page_info()
        return data

    def get_page_info(self):
        context = self.context
        if not self.paginate_by:
            return None
        page_info = {
            'page': context['page_obj'].number,
            'pageSize': context['paginator'].per_page,
            'total': context['paginator'].count,
            'lastPage': context['paginator'].num_pages,
        }
        return page_info

    def serialize(self):
        raise NotImplementedError


class DetailView(SingleObjectMixin, TemplateJSONView):
    def get(self, request, **kwargs):
        self.object = self.get_object()
        self.context = self.get_context_data()
        data = self.serialize()
        return data

    def serialize(self):
        raise NotImplementedError
