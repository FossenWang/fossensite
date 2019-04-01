import json

from django.test import TestCase, override_settings
from django.http import HttpRequest, Http404
from django.core.exceptions import PermissionDenied, SuspiciousOperation
from django.urls import path

from .views import JSONView, bad_request, permission_denied, \
    page_not_found, server_error


class TestView(JSONView):
    def get(self, request, code):
        if code == 200:
            data = 'test'
        elif code == 400:
            raise SuspiciousOperation(400)
        elif code == 403:
            raise PermissionDenied(403)
        elif code == 404:
            raise Http404(404)
        else:
            raise ValueError(f'Wrong code: {code}')
        return data

    def post(self, request, code):
        data = self.get_data()
        data['append'] = 'data'
        return data


urlpatterns = [
    path('<int:code>/', TestView.as_view()),
]


# Error handler
handler400 = bad_request
handler403 = permission_denied
handler404 = page_not_found
handler500 = server_error


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

    @override_settings(ROOT_URLCONF=__name__, DEBUG=False)
    def test_json_view_and_error_handler(self):
        c = self.client

        rsp = c.post('/200/', {'test': 123}, 'application/json')
        self.assertEqual(rsp.status_code, 200)
        self.assertDictEqual(rsp.json(), {'append': 'data', 'test': 123})

        rsp = c.post('/200/', {'test': 123})
        self.assertEqual(rsp.status_code, 200)
        self.assertDictEqual(rsp.json(), {'append': 'data', 'test': '123'})

        rsp = c.get('/200/')
        self.assertEqual(rsp.status_code, 200)
        self.assertEqual(rsp.json(), 'test')

        rsp = c.get('/400/')
        self.assertEqual(rsp.status_code, 400)
        self.assertEqual(rsp.json()['msg'], '400')

        rsp = c.get('/403/')
        self.assertEqual(rsp.status_code, 403)
        self.assertEqual(rsp.json()['msg'], '403')

        rsp = c.get('/404/')
        self.assertEqual(rsp.status_code, 404)
        self.assertEqual(rsp.json()['msg'], '404')

        rsp = c.get('/notfound/')
        self.assertEqual(rsp.status_code, 404)

        with self.assertRaises(ValueError):
            rsp = c.get('/500/')
