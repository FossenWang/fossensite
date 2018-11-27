from django.urls import re_path, path
from comment.views import ArticleCommentView, CreateArticleCommentView, \
    CreateArticleCommentReplyView, DeleteArticleCommentView, DeleteArticleCommentReplyView
from .views import ArticleListView, ArticleCategoryView, ArticleTopicView, SearchArticleView, \
    ArticleDetailView, HomeView, upload_image, CategoryListView, TopicListView, LinkListView


app_name = 'blog'

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('category/', CategoryListView.as_view(), name='category_list'),
    path('topic/', TopicListView.as_view(), name='topic_list'),
    path('link/', LinkListView.as_view(), name='link_list'),
    path('article/', ArticleListView.as_view(), name='article_list'),
    path('article/<int:pk>/', ArticleDetailView.as_view(), name='detail'),
    path('article/category/<int:category_id>/', ArticleCategoryView.as_view(), name='category'),
    path('article/topic/<int:topic_id>/', ArticleTopicView.as_view(), name='topic'),
    path('article/search/', SearchArticleView.as_view(), name='search'),
    path('article/upload/image/', upload_image, name='upload_image'),
    path('article/<int:article_id>/comment/', ArticleCommentView.as_view(), name='article_comment'),
    path('article/comment/create/', CreateArticleCommentView.as_view(), name='create_article_comment'),
    path('article/comment/reply/create/', CreateArticleCommentReplyView.as_view(), name='create_article_comment_reply'),
    path('article/comment/delete/(?P<pk>[0-9]+)/', DeleteArticleCommentView.as_view(), name='delete_article_comment'),
    path('article/comment/reply/delete/(?P<pk>[0-9]+)/', DeleteArticleCommentReplyView.as_view(), name='delete_article_comment_reply'),
]
