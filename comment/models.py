'评论应用模型'
from django.db import models
from django.contrib.auth.models import User
from blog.views import Article

class BaseComment(models.Model):
    '基础评论模型'
    content = models.TextField('评论', max_length=500)
    time = models.DateTimeField('评论时间', auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='评论者')

    class Meta:
        abstract = True

class ArticleComment(BaseComment):
    '文章评论'
    article = models.ForeignKey(Article, on_delete=models.CASCADE, verbose_name='评论文章')

    def __str__(self):
        return 'comment on article: ' + self.article.title

    class Meta:
        verbose_name = '文章评论'
        verbose_name_plural = '文章评论'
