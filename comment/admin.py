from django.contrib import admin

from .models import ArticleComment, ArticleCommentReply

admin.site.register([ArticleComment, ArticleCommentReply])
