from django.urls import path
from django.contrib.auth.views import LogoutView

from . import views


app_name = 'account'

urlpatterns = [
    path('notifications/', views.UserHomeView.as_view(), name='home'),
    path('comment_notices/', views.CommentNoticesView.as_view(), name='commment_notices'),
    path('profile/', views.ProfileDetailView.as_view(), name='profile'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('login/prepare/', views.PrepareLoginView.as_view(), name='login_prepare'),
    path('oauth/github/', views.GitHubOAuthView.as_view(), name='github_oauth'),
    path('oauth/edit_name/', views.OAuthEditUsername.as_view(), name='edit_name'),
]
