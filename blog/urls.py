from django.urls import path

from comment.urls import urlpatterns as comment_urls
from .views import ArticleListView, ArticleCategoryView, ArticleTopicView, SearchArticleView, \
    ArticleDetailView, HomeView, UploadImageView, CategoryListView, TopicListView, LinkListView


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
    path('article/upload/image/', UploadImageView.as_view(), name='upload_image'),
] + comment_urls
