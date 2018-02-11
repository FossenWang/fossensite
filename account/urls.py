from django.urls import re_path, path
from django.contrib.auth.views import LoginView, LogoutView

from . import views

app_name = 'account'

urlpatterns = [
    #re_path(r'^profile/$', views.ProfileDetailView.as_view(), name='profile'),
    path('login/password/', LoginView.as_view(), name='login_password'),
    path('logout/', LogoutView.as_view(), name='logout'),
    re_path(r'^login/$', views.OAuthLoginView.as_view(), name='login'),
    re_path(r'^oauth/github/$', views.GitHubOAuthView.as_view(), name='github_oauth'),
    re_path(r'^oauth/edit_name/$', views.OAuthEditUsername.as_view(), name='edit_name'),
]