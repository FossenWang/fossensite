from django.test import TestCase
from django.contrib.auth.models import User

from .models import Profile
from .migrations import add_github_url


class AccountTestCase(TestCase):
    def setUp(self):
        User.objects.create_superuser('admin', 'admin@fossne.cn', 'admin')
        self.user = User.objects.create_user('Fossen', 'fossen@fossen.cn', 'fossen')
        Profile.objects.create(user=self.user, avatar=None, github_id=1,
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
        rsp = c.get(f'/api/account/oauth/github/?code={self.user.pk}&state={csrftoken}')
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

        # 登陆失败
        rsp = c.get('/api/account/login/prepare/')
        self.assertEqual(rsp.status_code, 200)
        csrftoken = rsp.cookies.get('csrftoken').value
        # csrf 错误
        rsp = c.get(f'/api/account/oauth/github/?code={self.user.pk}&state=')
        self.assertEqual(rsp.status_code, 403)
        # 用户不存在
        rsp = c.get(f'/api/account/oauth/github/?code=100&state={csrftoken}')
        self.assertEqual(rsp.status_code, 403)
        # 登陆成功
        rsp = c.get(f'/api/account/oauth/github/?code={self.user.pk}&state={csrftoken}')
        self.assertEqual(rsp.status_code, 200)

        self._test_add_github_url()

    def _test_add_github_url(self):
        test_user = User.objects.create_user('test', 'test@fossen.cn', 'test')
        test_profile = Profile.objects.create(user=test_user, avatar=None, github_id=2)
        self.assertEqual(str(test_profile), str(test_profile.pk))

        add_github_url()

        test_profile.refresh_from_db()
        self.assertEqual(test_profile.github_url, 'https://github.com/test')
