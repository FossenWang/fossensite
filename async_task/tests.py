import json

from django.test import TestCase


class TaskTestCase(TestCase):
    def test_deploy(self):
        c = self.client
        rsp = c.post('/api/deploy/')
        self.assertEqual(json.loads(rsp.content), 'ignore')

        rsp = c.post('/api/deploy/', {}, 'application/json')
        self.assertEqual(json.loads(rsp.content), 'ignore')

        rsp = c.post('/api/deploy/', {'ref': 'refs/heads/test'}, 'application/json')
        self.assertEqual(json.loads(rsp.content), 'ignore')

        # rsp = c.post('/api/deploy/', {'ref': 'refs/heads/master'}, 'application/json')
        # self.assertEqual(json.loads(rsp.content), 'success')
