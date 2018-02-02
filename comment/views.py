from django.views.generic.list import BaseListView
from django.http import JsonResponse
'''
class JSONResponseMixin():
    def render_to_response(self, context, **response_kwargs):
        '将context中的内容传入JSON-serializable object，返回JsonResponse'
        return JsonResponse(get_json_data(context), **response_kwargs)

class BaseCommentView(JSONResponseMixin, BaseListView):

    def get_json_data(context):
        pass
'''