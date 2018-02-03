from django.conf.urls import re_path

from . import views

app_name = 'comment'

urlpatterns = [
    re_path(r'^article/(?P<article_pk>[0-9]+)/$', views.ArticleCommentView.as_view(), name='article_comment'),
    re_path(r'^create/$', views.CreateArticleCommentView.as_view(), name='create_article_comment'),
]
