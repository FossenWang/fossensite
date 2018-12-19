'评论应用模型'
from django.db import models
from django.contrib.auth.models import User
from blog.models import Article


class BaseComment(models.Model):
    '基础评论模型'
    content = models.TextField('评论', max_length=500)
    time = models.DateTimeField('评论时间', auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='评论者')

    def __str__(self):
        return self.content[:10]

    class Meta:
        abstract = True


class ArticleComment(BaseComment):
    '文章评论'
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='comments', verbose_name='评论文章')

    class Meta:
        ordering = ['-time']
        verbose_name = '文章评论'
        verbose_name_plural = '文章评论'
        indexes = [
            models.Index(fields=['-time'])
        ]


class ArticleCommentReply(BaseComment):
    '文章评论回复(二级评论)'
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='replies', verbose_name='评论文章')
    comment = models.ForeignKey(ArticleComment, on_delete=models.CASCADE, verbose_name='一级评论', related_name='replies')
    comment_user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='一级评论者', related_name='+')
    reply = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, verbose_name='二级评论', related_name='+')
    reply_user = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE, verbose_name='二级评论者', related_name='+')

    class Meta:
        ordering = ['time']
        verbose_name = '文章评论回复'
        verbose_name_plural = '文章评论回复'
        indexes = [
            models.Index(fields=['time'])
        ]
