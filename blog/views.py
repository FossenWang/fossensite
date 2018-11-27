from django.views.generic import DetailView
from django.core.exceptions import PermissionDenied
from django.core.files.storage import default_storage
from django.http import JsonResponse
from django.conf import settings
from django.utils import timezone
from django.db.models import Q
# from django.contrib.auth.models import User

from tools.views import ListView
from .models import Article, Category, Topic


class CategoryListView(ListView):
    model = Topic
    template_name = 'index.html'
    context_object_name = 'cates'

    def get_queryset(self):
        return Category.objects.filter(number__gt=0)

    def serialize(self):
        context = self.context
        cates = []
        for c in context['cates']:
            cates.append({
                'id': c.id,
                'name': c.name,
            })
        return {'data': cates}


class TopicListView(ListView):
    model = Topic
    template_name = 'index.html'
    context_object_name = 'topics'

    def get_queryset(self):
        return Topic.objects.filter(number__gt=0)

    def serialize(self):
        context = self.context
        topics = []
        for c in context['topics']:
            topics.append({
                'id': c.id,
                'name': c.name,
            })
        return {'data': topics}


class ArticleListView(ListView):
    '文章列表视图'
    model = Article
    template_name = 'index.html'
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
        context = self.context
        articles = []
        for article in context['articles']:
            item = {
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
            articles.append(item)
        return {'data': articles}


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
        if ql<0 or ql>88:
            raise PermissionDenied
        q = q.split(' ')
        while '' in q:
            q.remove('')
        queryset = super().get_queryset()
        for k in q:
            queryset = queryset.filter(Q(title__icontains=k) | Q(content__icontains=k))
        return queryset


class ArticleDetailView(DetailView):
    '文章详情视图'
    model = Article
    template_name = 'blog/article_detail.html'
    context_object_name = 'article'

    def get_context_data(self, **kwargs):
        context = super(ArticleDetailView, self).get_context_data(**kwargs)
        # 不用article.pk是因为这样会导致一次数据库查询
        # 设置缓存就是为了避查询数据库
        context['pk'] = self.kwargs['pk']
        # 每处理一次get请求就增加一次阅读量
        self.object.increase_views()
        return context

def upload_image(request):
    if request.method == 'POST':
        image = request.FILES['upload_image']
        if image.name.split('.')[-1] in ['jpg', 'jpeg', 'png', 'bmp', 'gif']:
            file_path = settings.MEDIA_ROOT + '/blog/image/' + image.name[-10:]
            file_path = default_storage.save(file_path, image)
            return JsonResponse({
                'success': True,
                #返回的是文件的url
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
