from django.conf.urls import re_path
from comment.views import ArticleCommentView, CreateArticleCommentView, \
CreateArticleCommentReplyView, DeleteArticleCommentView, DeleteArticleCommentReplyView
from . import views

app_name = 'blog'

urlpatterns = [
    re_path(r'^(?P<pk>[0-9]+)/$', views.ArticleDetailView.as_view(), name='detail'),
    re_path(r'^category/(?P<category_id>[0-9]+)/$', views.CategoryView.as_view(), name='category'),
    re_path(r'^topic/(?P<topic_id>[0-9]+)/$', views.TopicView.as_view(), name='topic'),
    re_path(r'^search/$', views.search, name='search'),
    re_path(r'^upload/image/$', views.upload_image, name='upload_image'),
    re_path(r'^(?P<article_id>[0-9]+)/comment/$', ArticleCommentView.as_view(), name='article_comment'),
    re_path(r'^comment/create/$', CreateArticleCommentView.as_view(), name='create_article_comment'),
    re_path(r'^comment/reply/create/$', CreateArticleCommentReplyView.as_view(), name='create_article_comment_reply'),
    re_path(r'^comment/delete/(?P<pk>[0-9]+)/$', DeleteArticleCommentView.as_view(), name='delete_article_comment'),
    re_path(r'^comment/reply/delete/(?P<pk>[0-9]+)/$', DeleteArticleCommentReplyView.as_view(), name='delete_article_comment_reply'),
]