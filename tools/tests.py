import json

from django.test import TestCase
from django.http import HttpRequest

from pprint import pprint

from .views import JSONView


class ToolsTestCase(TestCase):
    def test_json_view(self):
        request = HttpRequest()
        data = {'test': 123}
        request._body = bytes(json.dumps(data), 'utf8')
        request.content_type = 'application/json'
        json_view = JSONView()
        json_view.request = request

        self.assertTrue(json_view.is_json())
        self.assertDictEqual(json_view.json(), data)
        self.assertTrue(request.is_json)
        pprint(request.json)
        self.assertDictEqual(request.json, data)
