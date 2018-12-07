from django.urls import path

from .views import ArticleCommentView, CreateArticleCommentView, \
    CreateArticleCommentReplyView, DeleteArticleCommentView, DeleteArticleCommentReplyView


app_name = 'comment'

urlpatterns = [
    path('article/<int:article_id>/comment/', ArticleCommentView.as_view(), name='article_comment'),
    # path('article/comment/create/', CreateArticleCommentView.as_view(), name='create_article_comment'),
    # path('article/comment/reply/create/', CreateArticleCommentReplyView.as_view(), name='create_article_comment_reply'),
    # path('article/comment/delete/<int:pk>/', DeleteArticleCommentView.as_view(), name='delete_article_comment'),
    # path('article/comment/reply/delete/<int:pk>/', DeleteArticleCommentReplyView.as_view(), name='delete_article_comment_reply'),
]
