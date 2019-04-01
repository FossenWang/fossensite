from django.views import View
from django.views.generic.detail import SingleObjectMixin
from django.views.generic.list import MultipleObjectMixin
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.core.exceptions import SuspiciousOperation
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.urls.exceptions import Resolver404


def bad_request(request, exception):
    return JsonResponse({'msg': str(exception)}, status=400)

def permission_denied(request, exception):
    return JsonResponse({'msg': str(exception)}, status=403)

def page_not_found(request, exception):
    msg = None
    if isinstance(exception, Resolver404):
        msg = f'Not Found: {exception.args[0].get("path")}'
    else:
        msg = str(exception)
    return JsonResponse({'msg': msg}, status=404)

def server_error(request):
    return JsonResponse({'msg': 'Server Error'}, status=500)


class JSONMixin:
    """
    A mixin that can be used to render a JSON response.
    """

    def dispatch(self, request: HttpRequest, *args, **kwargs):
        response = super().dispatch(request, *args, **kwargs)
        if not isinstance(response, HttpResponse):
            response = self.render_to_json_response(response)
        return response

    def render_to_json_response(self, data, safe=False, **response_kwargs):
        """
        Returns a JSON response.
        """
        return JsonResponse(data, safe=safe, **response_kwargs)

    def get_data(self):
        """
        Returns an object from JSON or POST data.
        """
        if getattr(self.request, 'is_json', None):
            data = getattr(self.request, 'json', None)
        else:
            data = self.request.POST.dict()
        return data


class JSONView(JSONMixin, View):
    pass


class ListView(MultipleObjectMixin, JSONView):
    def get(self, request: HttpRequest, **kwargs):
        self.object_list = self.get_queryset()
        self.context = self.get_context_data()
        data = self.serialize()
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
        data = {}
        if self.paginate_by:
            data['pageInfo'] = self.get_page_info()
        return data


class CreateMixin:
    invalid_message = 'Post data invalid.'

    def post(self, request: HttpRequest, **kwargs):
        self.data = self.get_data()
        if self.validate_data(self.data):
            return self.data_valid(self.data)
        return self.data_invalid(self.data)

    def validate_data(self, data):
        raise NotImplementedError("Not implemented yet.")

    def data_valid(self, data):
        raise NotImplementedError("Not implemented yet.")

    def data_invalid(self, msg=invalid_message, data=None):
        raise SuspiciousOperation(msg)


class DetailView(SingleObjectMixin, JSONView):
    def get(self, request: HttpRequest, **kwargs):
        if not hasattr(self, 'object'):
            self.object = self.get_object()
        context = self.get_context_data()
        return context


class DeletionMixin:
    def delete(self, request, *args, **kwargs):
        if not hasattr(self, 'object'):
            self.object = self.get_object()
        self.object.delete()
        return self.render_to_json_response('', status=204)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CSRFView(JSONView):
    def get(self, request: HttpRequest):
        return {'csrftoken': request.META['CSRF_COOKIE']}
