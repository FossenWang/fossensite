'健身应用模型'
from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse

class BaseTypeModel(models.Model):
    '基础分类模型'
    name  = models.CharField('名称', max_length=16)
    number = models.PositiveIntegerField('次序', default=0)
    def __str__(self):
        return self.name
    class Meta:
        abstract = True


class Equipment(BaseTypeModel):
    '器材'
    def get_absolute_url(self):
        return reverse('fitness:equipment', kwargs={'pk': self.pk})

    class Meta:
        ordering = ['number','id']
        verbose_name = '器材'
        verbose_name_plural = '器材'


class MuscleGroup(BaseTypeModel):
    '锻炼部位'
    def get_absolute_url(self):
        return reverse('fitness:muscle_group', kwargs={'pk': self.pk})

    class Meta:
        ordering = ['number','id']
        verbose_name = '锻炼部位'
        verbose_name_plural = '锻炼部位'


class Exercise(models.Model):
    '训练动作'
    name = models.CharField('动作名', max_length=16)
    description = models.TextField('动作描述', blank=True)
    cover = models.ImageField(upload_to='fitness/exercise/cover', default='fitness/exercise/cover/none.jpg', verbose_name='封面图')
    number = models.PositiveIntegerField('次序', default=0)
    equipment = models.ForeignKey(Equipment, default=1, on_delete=models.SET_DEFAULT, verbose_name='器材')
    muscle = models.ForeignKey(MuscleGroup, default=1, on_delete=models.SET_DEFAULT, verbose_name='锻炼部位')
    # measurement:volunm,reps,duration
    def get_absolute_url(self):
        return reverse('fitness:exercise', kwargs={'pk': self.pk})

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['muscle_id','equipment_id','id']
        verbose_name = '动作'
        verbose_name_plural = '动作'


class ProgramType(BaseTypeModel):
    '方案类型'
    def get_absolute_url(self):
        return reverse('fitness:program_type', kwargs={'pk': self.pk})

    class Meta:
        ordering = ['number','id']
        verbose_name = '方案类型'
        verbose_name_plural = '方案类型'


class Program(models.Model):
    name = models.CharField('方案名', max_length=48)
    cover = models.ImageField(upload_to='fitness/program/cover', blank=True, null=True, verbose_name='封面图')
    description = models.TextField('方案说明', blank=True)
    cycle = models.PositiveIntegerField('周期', default=7)
    ptype = models.ForeignKey(ProgramType, default=1, on_delete=models.SET_DEFAULT, verbose_name='方案类型')
    creator = models.ForeignKey(User, default=1, on_delete=models.SET_DEFAULT, verbose_name='创建者')
    training = models.TextField('训练内容')

    def get_absolute_url(self):
        return reverse('fitness:program', kwargs={'pk': self.pk})

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = '训练方案'
        verbose_name_plural = '训练方案'
