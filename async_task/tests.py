import json

from django.http import HttpResponseForbidden
from django.test import TestCase, Client


c = Client()

class TaskTestCase(TestCase):
    def test_deploy(self):
        rsp = c.post('/deploy')
        self.assertEqual(json.loads(rsp.content), 'ignore')

        rsp = c.post('/deploy', {}, 'application/json')
        self.assertEqual(json.loads(rsp.content), 'ignore')

        rsp = c.post('/deploy', {'ref': 'refs/heads/test'}, 'application/json')
        self.assertEqual(json.loads(rsp.content), 'ignore')

        # rsp = c.post('/deploy', {'ref': 'refs/heads/master'}, 'application/json')
        # self.assertEqual(json.loads(rsp.content), 'success')
