import os
from django.shortcuts import render, get_object_or_404
from django.views.generic import ListView, DetailView, TemplateView
from django.core.exceptions import PermissionDenied
from django.core.files.storage import default_storage
from django.http import JsonResponse
from django.conf import settings
from django.utils import timezone
from django.db.models import Q

from .models import Article, Category, Topic

class HomeView(TemplateView):
    '首页视图'
    template_name = 'blog/home.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['articles'] = Article.objects.filter(pub_date__lt=timezone.now())[:10]
        return context

class ArticleListView(ListView):
    '文章列表视图'
    model = Article
    template_name = 'blog/article_list.html'
    context_object_name = 'articles'
    paginate_by = 10
    allow_empty = False

    def get_context_data(self, **kwargs):
        '处理分页数据'
        context = super().get_context_data(**kwargs)
        paginator = context.get('paginator')
        page = context.get('page_obj')
        is_paginated = context.get('is_paginated')
        pagination_data = self.pagination_data(paginator, page, is_paginated)
        context.update(pagination_data)
        return context

    def pagination_data(self, paginator, page, is_paginated):
        if not is_paginated:
            return {}

        left, right= [], []
        left_has_more = False
        right_has_more = False
        first = False
        last = False
        page_number = page.number
        total_pages = paginator.num_pages
        page_range = paginator.page_range

        if page_number == 1:
            right = page_range[page_number:page_number + 2]
            if right[-1] < total_pages - 1:
                right_has_more = True
            if right[-1] < total_pages:
                last = True
        elif page_number == total_pages:
            left = page_range[(page_number - 3) if (page_number - 3) > 0 else 0:page_number - 1]
            if left[0] > 2:
                left_has_more = True
            if left[0] > 1:
                first = True
        else:
            left = page_range[(page_number - 3) if (page_number - 3) > 0 else 0:page_number - 1]
            right = page_range[page_number:page_number + 2]
            if right[-1] < total_pages - 1:
                right_has_more = True
            if right[-1] < total_pages:
                last = True
            if left[0] > 2:
                left_has_more = True
            if left[0] > 1:
                first = True

        data = {
            'left': left,
            'right': right,
            'left_has_more': left_has_more,
            'right_has_more': right_has_more,
            'first': first,
            'last': last,
        }

        return data

class CategoryView(ArticleListView):
    '文章分类视图'
    def get_queryset(self):
        if self.kwargs.get('category_id') == '1':
            return super(CategoryView, self).get_queryset()
        else:
            return super(CategoryView, self).get_queryset().filter(category_id=self.kwargs.get('category_id'))

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['category_id'] = self.kwargs.get('category_id')
        return context

class TopicView(ArticleListView):
    '文章话题视图'
    def get_queryset(self):
        topic = get_object_or_404(Topic, id=self.kwargs.get('topic_id'))
        return super(TopicView, self).get_queryset().filter(topics=topic)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['topic_id'] = int(self.kwargs.get('topic_id'))
        return context

class ArticleDetailView(DetailView):
    '文章详情视图'
    model = Article
    template_name = 'blog/article_detail.html'
    context_object_name = 'article'

    def get_context_data(self, **kwargs):
        context = super(ArticleDetailView, self).get_context_data(**kwargs)
        #每处理一次get请求就增加一次阅读量
        self.object.increase_views()
        return context

def search(request):
    q = request.GET.get('q')
    error_msg = ''

    if not q:
        error_msg = "请输入关键词"
        return render(request, 'blog/index.html', {'error_msg': error_msg})

    article_list = Article.objects.filter(Q(title__icontains=q) | Q(content__icontains=q))
    return render(request, 'blog/index.html', {'error_msg': error_msg,
                                               'article_list': article_list})

def upload_image(request):
    if request.method == 'POST':
        image = request.FILES.get("upload_image")
        if image.name.split('.')[-1] in ['jpg', 'jpeg', 'png', 'bmp', 'gif']:
            file_path = settings.MEDIA_ROOT + '/blog/image/' + image.name[-10:]
            file_path = default_storage.save(file_path, image)
            return JsonResponse({
                "success": True,
                #返回的是文件的url
                'file_path': settings.MEDIA_URL + 'blog/image/' + os.path.split(file_path)[-1],
                'msg': 'Success!'
                })
        else:
            return JsonResponse({
                'success': False,
                'file_path': '',
                'msg': 'Unexpected File Format!'
                })
    else:
        raise PermissionDenied('Only Accept POST Method!')
