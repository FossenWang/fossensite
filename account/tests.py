from django.test import TestCase
from django.contrib.auth.models import User

from .models import Profile


class AccountTestCase(TestCase):
    def setUp(self):
        User.objects.create_superuser('admin', 'admin@fossne.cn', 'admin')
        user = User.objects.create_user('Fossen', 'fossen@fossen.cn', 'fossen')
        Profile.objects.create(user=user, avatar=None, github_id=1,
                               github_url='https://github.com/FossenWang')
        self.client.defaults = {'HTTP_ACCEPT': 'application/json'}

    def test_user(self):
        c = self.client
        # 登录准备
        rsp = c.get('/api/account/login/prepare/?next=/article/')
        self.assertEqual(rsp.status_code, 200)
        self.assertEqual(rsp.cookies.get('next').value, '/article/')
        csrftoken = rsp.cookies.get('csrftoken').value
        # 模拟登录
        rsp = c.get('/api/account/oauth/github/?code=2&state=' + csrftoken)
        self.assertEqual(rsp.status_code, 200)
        r = rsp.json()
        self.assertEqual(set(r), {'user', 'next'})
        self.assertEqual(set(r['user']), {
            'id', 'github_url', 'avatar', 'new_notice', 'username'})
        self.assertEqual(r['next'], '/article/')
        # 获取用户信息
        rsp = c.get('/api/account/profile/')
        self.assertEqual(rsp.status_code, 200)
        self.assertEqual(set(rsp.json()), {
            'id', 'github_url', 'avatar', 'new_notice', 'username'})
        self.assertEqual(rsp.json()['id'], 2)
        # 退出登录
        rsp = c.get('/api/account/logout/')
        self.assertEqual(rsp.status_code, 200)
        self.assertEqual(set(rsp.json()), {
            'id', 'github_url', 'avatar', 'new_notice', 'username'})
        # 退出登录后为匿名用户
        rsp = c.get('/api/account/profile/')
        self.assertEqual(rsp.status_code, 200)
        self.assertEqual(set(rsp.json()), {
            'id', 'github_url', 'avatar', 'new_notice', 'username'})
        self.assertEqual(rsp.json()['id'], None)
