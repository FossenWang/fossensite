from django.core.exceptions import PermissionDenied
from django.core.files.storage import default_storage
from django.http import JsonResponse
from django.conf import settings
from django.utils import timezone
from django.db.models import Q

from tools.views import ListView, DetailView
from .models import Article, Category, Topic, Link


class CategoryListView(ListView):
    model = Topic
    context_object_name = 'cates'

    def get_queryset(self):
        return Category.objects.filter(number__gt=0)

    def serialize(self):
        data = super().serialize()
        context = self.context
        cates = []
        for i in context['cates']:
            cates.append({
                'id': i.id,
                'name': i.name,
            })
        data['data'] = cates
        return data


class TopicListView(ListView):
    model = Topic
    context_object_name = 'topics'

    def get_queryset(self):
        return Topic.objects.filter(number__gt=0)

    def serialize(self):
        data = super().serialize()
        context = self.context
        topics = []
        for i in context['topics']:
            topics.append({
                'id': i.id,
                'name': i.name,
            })
        data['data'] = topics
        return data


class LinkListView(ListView):
    model = Link
    context_object_name = 'links'

    def serialize(self):
        data = super().serialize()
        context = self.context
        links = []
        for i in context['links']:
            links.append({
                'id': i.id,
                'name': i.name,
                'url': i.url
            })
        data['data'] = links
        return data


def serialize_article(article):
    result = {
        'id': article.id,
        'cover': article.cover.url if article.cover else None,
        'title': article.title,
        'content': article.content,
        'views': article.views,
        'pub_date': article.pub_date.isoformat(),
        'category': {
            'id': article.category.id,
            'name': article.category.name,
        },
        'topics': [{
            'id': t.id,
            'name': t.name,
        } for t in article.topics.all()],
    }
    return result


class ArticleListView(ListView):
    '文章列表视图'
    model = Article
    context_object_name = 'articles'
    paginate_by = 10
    allow_empty = True

    def get_queryset(self):
        return super().get_queryset() \
            .filter(pub_date__lt=timezone.now()) \
            .filter(category__number__gt=0) \
            .defer('author') \
            .select_related('category') \
            .prefetch_related('topics')

    def serialize(self):
        data = super().serialize()
        context = self.context
        articles = []
        for article in context['articles']:
            item = serialize_article(article)
            articles.append(item)
        data['data'] = articles
        return data


class HomeView(ArticleListView):
    '首页视图'
    pass


class ArticleCategoryView(ArticleListView):
    '文章分类视图'

    def get_queryset(self):
        return super().get_queryset().filter(category=self.kwargs['category_id'])


class ArticleTopicView(ArticleListView):
    '文章话题视图'

    def get_queryset(self):
        return super().get_queryset().filter(topics=self.kwargs['topic_id'])


class SearchArticleView(ArticleListView):
    '文章搜索视图'

    def get_queryset(self):
        q = self.request.GET['q']
        ql = len(q)
        if ql < 0 or ql > 88:
            raise PermissionDenied
        q = q.split(' ')
        while '' in q:
            q.remove('')
        queryset = super().get_queryset()
        for k in q:
            queryset = queryset.filter(
                Q(title__icontains=k) | Q(content__icontains=k))
        return queryset


class ArticleDetailView(DetailView):
    '文章详情视图'
    model = Article

    def get_context_data(self):
        article = self.object  # type: Article
        data = serialize_article(article)
        # 每处理一次get请求就增加一次阅读量
        article.increase_views()
        return data


def upload_image(request):
    if request.method == 'POST':
        image = request.FILES['upload_image']
        if image.name.split('.')[-1] in ['jpg', 'jpeg', 'png', 'bmp', 'gif']:
            file_path = settings.MEDIA_ROOT + '/blog/image/' + image.name[-10:]
            file_path = default_storage.save(file_path, image)
            return JsonResponse({
                'success': True,
                # 返回的是文件的url
                'file_path': settings.MEDIA_URL + 'blog/image/' + file_path.split('/')[-1],
                'msg': 'Success!'
            })
        else:
            return JsonResponse({
                'success': False,
                'file_path': '',
                'msg': 'Unexpected File Format!'
            })
    else:
        raise PermissionDenied('Only Accept POST Request!')
