'''
账户模型，拓展原生django的User模型
'''
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Profile(models.Model):
    '用户资料'
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name='用户')
    avatar = models.ImageField(upload_to='account/avatar', max_length=200, null=True, blank=True, verbose_name='头像')
    github_url = models.CharField('GitHub 个人主页', max_length=200, null=True, blank=True)
    github_id = models.PositiveIntegerField('GitHub id', unique=True, null=True, blank=True)
    new_notice = models.BooleanField('新的通知', default=False)
    read_notice = models.DateTimeField('已读通知', auto_now_add=True)

    def __str__(self):
        return str(self.pk)

    def get_new_notice(self):
        '收到新通知'
        if not self.new_notice:
            self.new_notice = True
            self.save()

    def have_read_notice(self):
        '已读通知'
        if self.new_notice:
            self.new_notice = False
            self.read_notice = timezone.now()
            self.save()

    class Meta:
        verbose_name = '用户资料'
        verbose_name_plural = '用户资料'


class BlankProfile:
    user_id = None
    user = None
    avatar = None
    github_id = None
    github_url = None
    new_notice = False
    read_notice = None
