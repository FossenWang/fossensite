from django.urls import path
from django.contrib.auth.views import LogoutView

from comment.views import UserReplyList
from . import views


app_name = 'account'

urlpatterns = [
    path('notice/', UserReplyList.as_view(), name='notice'),
    path('profile/', views.ProfileDetailView.as_view(), name='profile'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('login/prepare/', views.PrepareLoginView.as_view(), name='login_prepare'),
    path('oauth/github/', views.GitHubOAuthView.as_view(), name='github_oauth'),
    path('oauth/edit_name/', views.OAuthEditUsername.as_view(), name='edit_name'),
]
