import json

from django.test import TestCase
from django.http import HttpRequest, HttpResponse, HttpResponseNotFound

from .views import JSONView


class ToolsTestCase(TestCase):
    def test_json_request(self):
        request = HttpRequest()
        data = {'test': 123}

        request._body = bytes(json.dumps(data), 'utf8')
        request.content_type = 'application/json'
        self.assertTrue(request.is_json)
        self.assertDictEqual(request.json, data)
        self.assertDictEqual(request.get_json(), data)

        request.content_type = 'multipart/form-data'
        self.assertFalse(request.is_json)
        self.assertEqual(request.json, None)
        self.assertEqual(request.get_json(), None)
        self.assertDictEqual(request.get_json(force=True), data)

        request._body = b''
        self.assertRaises(json.decoder.JSONDecodeError, request.get_json, (True,))
        self.assertEqual(request.get_json(force=True, raise_error=False), None)

        request.content_type = 'application/json'
        self.assertTrue(request.is_json)
        self.assertEqual(request.json, None)
        self.assertRaises(json.decoder.JSONDecodeError, request.get_json)

    def test_json_view(self):
        class TestView(JSONView):
            def get(self, request):
                data = request.json
                data['a'] = 'a'
                return data

        request = HttpRequest()
        data = {'test': 123}

        request._body = bytes(json.dumps(data), 'utf8')
        request.content_type = 'application/json'
        request.method = 'GET'

        json_view = TestView.as_view()
        rsp = json_view(request)
        self.assertTrue(isinstance(rsp, HttpResponse))
        self.assertDictEqual(json.loads(rsp.content), {'test': 123, 'a': 'a'})

        class Test2View(JSONView):
            def get(self, request):
                return HttpResponseNotFound()

        self.assertIsInstance(Test2View.as_view()(request), HttpResponseNotFound)
