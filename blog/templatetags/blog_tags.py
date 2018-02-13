from django import template
from django.utils import timezone
from django.db.models.aggregates import Count
from blog.models import Article, Category, Topic

register = template.Library()

@register.simple_tag
def get_recent_articles(num=5):
    return Article.objects.all().order_by('-pub_date')[:num]

@register.simple_tag
def get_article_category_names():
    return Category.objects.filter(number__gt=0)

@register.simple_tag
def get_article_categories():
    return Category.objects.filter(number__gt=0) \
    .filter(article__pub_date__lt=timezone.now()) \
    .annotate(counts=Count('article'))

@register.simple_tag
def count_total_articles():
    '文章总数'
    return Article.objects.filter(pub_date__lt=timezone.now()).count()

@register.simple_tag
def get_topics():
    return Topic.objects.all()
