import requests

from django.shortcuts import redirect, reverse
from django.core.exceptions import PermissionDenied
from django.views.generic import View, FormView, DetailView, ListView, TemplateView
from django.contrib.auth.models import User
from django.contrib.auth import login
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.db.models import Q
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator

from fossensite import settings
from .models import Profile
from .forms import OauthEditUsernameForm
from comment.models import ArticleComment, ArticleCommentReply

class PageListView(ListView):
    '处理分页数据'
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        pagination_data = self.pagination_data(
            context['paginator'], context['page_obj'], context['is_paginated'])
        context.update(pagination_data)
        return context

    def pagination_data(self, paginator, page, is_paginated):
        '分页数据'
        if not is_paginated:
            return {}
        left = []
        right = []
        left_has_more = False
        right_has_more = False
        first = False
        last = False
        page_number = page.number
        total_pages = paginator.num_pages
        page_range = paginator.page_range

        if page_number == 1:
            right = page_range[page_number:page_number + 2]
            if right[-1] < total_pages - 1:
                right_has_more = True
            if right[-1] < total_pages:
                last = True

        elif page_number == total_pages:
            left = page_range[(page_number - 3) if (page_number - 3) > 0 else 0:page_number - 1]
            if left[0] > 2:
                left_has_more = True
            if left[0] > 1:
                first = True
        else:
            left = page_range[(page_number - 3) if (page_number - 3) > 0 else 0:page_number - 1]
            right = page_range[page_number:page_number + 2]
            if right[-1] < total_pages - 1:
                right_has_more = True
            if right[-1] < total_pages:
                last = True
            if left[0] > 2:
                left_has_more = True
            if left[0] > 1:
                first = True

        data = {
            'left': left,
            'right': right,
            'left_has_more': left_has_more,
            'right_has_more': right_has_more,
            'first': first,
            'last': last,
        }

        return data


class UserHomeView(LoginRequiredMixin, PageListView):
    '用户主页'
    model = ArticleCommentReply
    template_name = 'account/user_home.html'
    context_object_name = 'notices'
    paginate_by = 10

    def get_queryset(self):
        uid = self.request.user.id
        self.request.user.profile.have_read_notice()
        return super().get_queryset() \
        .filter(Q(comment__user_id=uid) | Q(reply__user_id=uid)) \
        .exclude(user=uid).order_by('-time') \
        .select_related('user', 'user__profile', 'comment__article') \
        .only('content', 'time', 'user__username', 'user__profile__avatar', 'comment__article__title')


class CommentNoticesView(UserPassesTestMixin, PageListView):
    '文章评论通知'
    model = ArticleComment
    template_name = 'account/comment_notices.html'
    context_object_name = 'notices'
    paginate_by = 10
    raise_exception = True

    def test_func(self):
        if self.request.user.id != 2:
            return False
        else:
            return True

    def get_queryset(self):
        self.request.user.profile.have_read_notice()
        return super().get_queryset() \
        .select_related('user', 'user__profile', 'article') \
        .only('content', 'time', 'user__username', 'user__profile__avatar', 'article__title')


class ProfileDetailView(DetailView):
    '用户资料视图'
    model = Profile
    template_name = 'account/profile.html'
    context_object_name = 'profile'


@method_decorator(ensure_csrf_cookie, name='dispatch')
class OAuthLoginView(TemplateView):
    '第三方登录视图'
    template_name = 'account/login.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        if 'next' in self.request.GET:
            self.request.session['next'] = self.request.GET['next']
        context['github_oauth_url'] = 'https://github.com/login/oauth/authorize?client_id={}&state={}' \
        .format(settings.GITHUB_CLIENT_ID, self.request.META['CSRF_COOKIE'])
        return context


class OAuthView(View):
    '第三方账号认证视图'
    access_token_url = None
    user_api = None
    client_id = None
    client_secret = None

    def get(self, request, *args, **kwargs):
        access_token = self.get_access_token(request)
        user_info = self.get_user_info(access_token)
        # 在子类中实现authenticate()方法
        return self.authenticate(user_info)

    def get_access_token(self, request):
        '获取access token'
        if 'state' not in request.GET or request.GET['state'] != self.request.COOKIES['csrftoken']:
            raise PermissionDenied

        url = self.access_token_url
        headers = {'Accept': 'application/json'}
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'code': request.GET['code']
        }
        r = requests.post(url, data, headers=headers, timeout=3)
        result = r.json()
        if 'access_token' in result:
            return result['access_token']
        else:
            raise PermissionDenied

    def get_user_info(self, access_token):
        '获取用户信息'
        url = self.user_api + access_token
        r = requests.get(url, timeout=3)
        user_info = r.json()
        return user_info

    def get_success_url(self):
        if 'next' in self.request.session:
            return self.request.session.pop('next')
        else:
            return '/'


class GitHubOAuthView(OAuthView):
    'github账号认证视图'
    access_token_url = settings.GITHUB_ACCESS_TOKEN_URL
    user_api = settings.GITHUB_USER_API
    client_id = settings.GITHUB_CLIENT_ID
    client_secret = settings.GITHUB_CLIENT_SECRET

    def authenticate(self, user_info):
        user = User.objects.filter(profile__github_id=user_info['id'])
        if not user:
            if User.objects.filter(username=user_info['login']).exists():
                self.request.session['github_oauth'] = user_info
                return redirect(reverse('account:edit_name'))

            user = User.objects.create_user(user_info['login'])
            profile = Profile(user=user, github_id=user_info['id'], avatar=user_info['avatar_url'])
            profile.save()
        else:
            user = user[0]
        login(self.request, user)
        return redirect(self.get_success_url())


class OAuthEditUsername(FormView):
    '通过第三方账户注册时，用户名若重复，则通过该视图修改合适的用户名'
    template_name = 'account/edit_name.html'
    form_class = OauthEditUsernameForm

    def dispatch(self, request, *args, **kwargs):
        if 'github_oauth' not in request.session:
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['username'] = self.request.session['github_oauth']['login']
        return context

    def form_valid(self, form):
        """If the form is valid, save the associated model."""
        if 'github_oauth' in self.request.session:
            user_info = self.request.session.pop('github_oauth')
            user = form.save()
            profile = Profile(user=user, github_id=user_info['id'], avatar=user_info['avatar_url'])
            profile.save()
            login(self.request, user)
        return super().form_valid(form)

    def get_success_url(self):
        if 'next' in self.request.session:
            return self.request.session.pop('next')
        else:
            return '/'
