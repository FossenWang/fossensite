'博客应用模型'
from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
# from django.core.cache import cache
# from django.core.cache.utils import make_template_fragment_key


class Category(models.Model):
    name = models.CharField('分类', max_length=16)
    number = models.PositiveIntegerField('次序', default=0)

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('blog:category', kwargs={'category_id': self.pk})

    class Meta:
        ordering = ['number']
        verbose_name = '分类'
        verbose_name_plural = '分类'


class Topic(models.Model):
    name = models.CharField('话题', max_length=16)
    number = models.PositiveIntegerField('次序', default=0)

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('blog:topic', kwargs={'topic_id': self.pk})

    class Meta:
        ordering = ['number']
        verbose_name = '话题'
        verbose_name_plural = '话题'


class Article(models.Model):
    '文章'
    title = models.CharField('标题', max_length=100)
    cover = models.ImageField(
        upload_to='blog/cover', blank=True, null=True, verbose_name='封面图')
    content = models.TextField('内容')
    pub_date = models.DateTimeField('发布日期')
    # 作者与分类的默认值为2和1,代表着相应数据库中id的字段,分别手动将其设置为了fossen和未分类
    author = models.ForeignKey(
        User, default=2, on_delete=models.SET_DEFAULT, verbose_name='作者')
    category = models.ForeignKey(
        Category, default=1, on_delete=models.SET_DEFAULT, verbose_name='分类')
    topics = models.ManyToManyField(Topic, verbose_name='话题')
    views = models.PositiveIntegerField('阅读量', default=0)

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('blog:detail', kwargs={'pk': self.pk})

    def increase_views(self):
        self.views += 1
        super().save(update_fields=['views'])

    # def save(self, *args, **kwargs):
    #     super().save(*args, **kwargs)
    #     # 保存后清空相关缓存
    #     cache.delete(make_template_fragment_key('home'))
    #     cache.delete(make_template_fragment_key('article_detail', [self.id]))
    #     cache.delete(make_template_fragment_key(
    #         'article_detail_title', [self.id]))
    #     c_pages = self.category.article_set.count()//10 + 1
    #     for i in range(1, c_pages+1):
    #         cache.delete(make_template_fragment_key(
    #             'article_category', [self.category.id, i]))
    #     for topic in self.topics.all():
    #         t_pages = topic.article_set.count()//10 + 1
    #         for i in range(1, t_pages+1):
    #             cache.delete(make_template_fragment_key(
    #                 'article_topic', [topic.id, i]))

    class Meta:
        ordering = ['-pub_date']
        verbose_name = '文章'
        verbose_name_plural = '文章'


class Link(models.Model):
    '友情链接'
    name = models.CharField('网站名', max_length=100)
    url = models.CharField('网址', max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = '友情链接'
        verbose_name_plural = '友情链接'
