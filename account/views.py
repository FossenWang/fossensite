import requests

from django.core.exceptions import PermissionDenied, ObjectDoesNotExist
from django.contrib.auth.models import User
from django.contrib.auth import login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator

from fossensite import settings
from tools.views import JSONView

from .models import Profile, BlankProfile


class ProfileDetailView(JSONView):
    '登录用户的资料视图'

    def get(self, request):
        user = request.user
        try:
            profile = user.profile
        except (ObjectDoesNotExist, AttributeError):
            profile = BlankProfile
        data = {
            'id': user.id,
            'username': user.username,
            'avatar': profile.avatar.name if profile.avatar else None,
            'github_url': profile.github_url,
            'new_notice': profile.new_notice,
        }
        return data


class LogoutView(ProfileDetailView):
    def get(self, request):
        logout(request)
        return super().get(request)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class PrepareLoginView(JSONView):
    def get(self, request, **kwargs):
        context = {'github_oauth_url': 'https://github.com/login/oauth/authorize?client_id={}&state={}' \
            .format(settings.GITHUB_CLIENT_ID, self.request.META['CSRF_COOKIE'])}
        rsp = self.render_to_json_response(context)
        next_url = self.request.GET.get('next')
        if next_url:
            rsp.set_cookie('next', next_url)
        return rsp


class GitHubOAuthView(JSONView):
    'github账号认证视图'
    access_token_url = settings.GITHUB_ACCESS_TOKEN_URL
    user_api = settings.GITHUB_USER_API
    client_id = settings.GITHUB_CLIENT_ID
    client_secret = settings.GITHUB_CLIENT_SECRET

    def get(self, request, *args, **kwargs):
        if settings.DEBUG and self.request.GET.get('id'):
            return self.login_in_test()
        access_token = self.get_access_token()
        user_info = self.get_user_info(access_token)
        return self.authenticate(user_info)

    def get_access_token(self):
        '获取access token'
        if self.request.GET.get('state') != self.request.COOKIES.get('csrftoken'):
            raise PermissionDenied()

        url = self.access_token_url
        headers = {'Accept': 'application/json'}
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'code': self.request.GET.get('code')
        }
        r = requests.post(url, data, headers=headers, timeout=3)
        result = r.json()
        if 'access_token' not in result:
            raise PermissionDenied()
        return result['access_token']

    def get_user_info(self, access_token):
        '获取用户信息'
        url = self.user_api + access_token
        r = requests.get(url, timeout=3)
        user_info = r.json()
        return user_info

    def authenticate(self, user_info):
        user = User.objects.filter(profile__github_id=user_info.get('id'))
        if not user:
            user = User.objects.create_user(user_info.get('login'))
            profile = Profile(user=user, avatar=user_info.get('avatar_url'),
                              github_id=user_info.get('id'),
                              github_url=user_info.get('html_url'))
            profile.save()
        else:
            user.profile.update(**{
                'avatar': user_info.get('avatar_url'),
                'github_url': user_info.get('html_url')})
            user = user[0]
        return self.login_user(user)

    def login_user(self, user):
        login(self.request, user)
        profile = user.profile
        user_data = {
            'id': user.id,
            'username': user.username,
            'avatar': profile.avatar.name if profile.avatar else None,
            'github_url': profile.github_url,
            'new_notice': profile.new_notice,
        }

        url = self.request.COOKIES.get('next')
        if not url:
            url = '/'

        rsp = self.render_to_json_response({'next': url, 'user': user_data})
        rsp.delete_cookie('next')
        return rsp

    def login_in_test(self):
        if self.request.GET.get('state') != self.request.COOKIES.get('csrftoken'):
            raise PermissionDenied('Wrong csrftoken.')
        try:
            user = User.objects.get(pk=self.request.GET.get('id'))
        except ObjectDoesNotExist:
            raise PermissionDenied('没有该用户')
        return self.login_user(user)
