from django.urls import path

from .views import ArticleCommentView, ArticleCommentReplyView, \
    DeleteArticleCommentView, DeleteArticleCommentReplyView


app_name = 'comment'

urlpatterns = [
    path('article/<int:article_id>/comment/', ArticleCommentView.as_view(), name='article_comment'),
    path('article/<int:article_id>/comment/reply/', ArticleCommentReplyView.as_view(), name='article_comment_reply'),
    path('article/comment/<int:pk>/', DeleteArticleCommentView.as_view(), name='delete_comment'),
    path('article/reply/<int:pk>/', DeleteArticleCommentReplyView.as_view(), name='delete_comment_reply'),
]
