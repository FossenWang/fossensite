'''
账户模型，拓展原生django的User模型
'''
from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    '用户资料'
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name='用户')
    avatar = models.ImageField(upload_to='account/avatar', null=True, blank=True, verbose_name='头像')
    nickname = models.CharField('昵称', max_length=16)

    def __str__(self):
        return self.user.username

    class Meta:
        verbose_name = '用户资料'
        verbose_name_plural = '用户资料'
