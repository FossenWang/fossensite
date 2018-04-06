from django.views.generic.list import ListView
from django.views.generic.edit import BaseCreateView, BaseDeleteView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.http import HttpResponseBadRequest, HttpResponseNotAllowed, HttpResponseRedirect
from django.urls import reverse, NoReverseMatch
from django.db.models import Prefetch
from django.core.exceptions import ImproperlyConfigured
from django.core.cache import cache
from django.core.cache.utils import make_template_fragment_key

from .models import ArticleComment, ArticleCommentReply
from .forms import ArticleCommentForm, ArticleCommentReplyForm


class Mygenerator():
    def __init__(self, generator):
        self.generator = generator
    def next(self):
        return next(self.generator)

class ArticleCommentView(ListView):
    '文章评论列表'
    model = ArticleComment
    # 前端使用Ajax请求评论数据，故该模板仅包含评论部分
    template_name = 'comment/article_comment.html'
    context_object_name = 'comment_list'
    paginate_by = 10

    def get_queryset(self):
        replies = ArticleCommentReply.objects \
        .select_related('user', 'user__profile', 'reply__user') \
        .only('content', 'time', 'user__username', 'user__profile__avatar', 'reply__user__username')
        return super().get_queryset() \
        .filter(article_id=self.kwargs['article_id']) \
        .select_related('user', 'user__profile') \
        .only('content', 'time', 'user__username', 'user__profile__avatar') \
        .prefetch_related(Prefetch('replies', queryset=replies))

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        context['article_id'] = self.kwargs['article_id']

        if context["page_obj"].number == 1 and self.request.user.is_authenticated:
            context['form'] = ArticleCommentForm({'article': self.kwargs['article_id']})

            sum_cache = 'article_%s_comment_sum' % context['article_id']
            context['sum'] = cache.get(sum_cache)
            if not context['sum']:
                q1 = ArticleComment.objects.filter(article_id=context['article_id']).values('id')
                q2 = ArticleCommentReply.objects.filter(comment__article_id=context['article_id']).values('id')
                context['sum'] = q1.union(q2).count()
                cache.set(sum_cache, context['sum'], 604800)

        first_num = context["paginator"].count - \
            self.paginate_by * (context["page_obj"].number - 1)
        last_num = first_num - self.paginate_by
        context['numbers'] = Mygenerator(iter(range(first_num, last_num, -1)))
        return context

class EditArticleCommentMixin():
    '修改文章评论Mixin'
    def get_success_url(self):
        '操作成功后转向文章详情页'
        try:#POST字典中必须提供文章的id
            url = reverse('blog:detail', kwargs={'pk': self.request.POST['article']})
        except NoReverseMatch:
            raise ImproperlyConfigured('Wrong URL to redirect.')
        return url

    def render_to_response(self, context, **response_kwargs):
        '禁止get方法和form无效的post'
        if self.request.method == "GET":
            return HttpResponseNotAllowed('Get Method Not Alllowed')
        else:
            return HttpResponseBadRequest('Invalid Form')

    def form_valid(self, form):
        '保存前设置创建评论的用户'
        self.object = form.save(commit=False)
        self.object.user = self.request.user
        self.object.save()
        self.clean_caches()
        return HttpResponseRedirect(self.get_success_url())

    def delete(self, *args, **kwargs):
        self.clean_caches()
        return super().delete(*args, **kwargs)

    def clean_caches(self):
        article_id = self.request.POST['article']
        cache.delete('article_%s_comment_sum' % article_id)
        pages = ArticleComment.objects.filter(article_id=article_id).count()//10 + 1
        for i in range(1, pages+1):
            cache.delete(make_template_fragment_key('article_comment', [article_id, i]))

class CreateArticleCommentView(LoginRequiredMixin, EditArticleCommentMixin, BaseCreateView):
    '创建一条新的文章评论'
    model = ArticleComment
    form_class = ArticleCommentForm

class CreateArticleCommentReplyView(CreateArticleCommentView):
    '创建一条新的文章二级评论'
    model = ArticleCommentReply
    form_class = ArticleCommentReplyForm

class CommentCreatorTestMixin(UserPassesTestMixin):
    '验证发送请求的用户是否是评论创建者'
    def test_func(self):
        if self.request.user.is_authenticated:
            self.object = self.get_object()
            is_creator = self.request.user.id == self.object.user_id
            self.raise_exception = not is_creator
        else:
            is_creator = False
        return is_creator

class DeleteArticleCommentView(CommentCreatorTestMixin, EditArticleCommentMixin, BaseDeleteView):
    '删除一条文章评论'
    model = ArticleComment

class DeleteArticleCommentReplyView(DeleteArticleCommentView):
    '删除一条文章二级评论'
    model = ArticleCommentReply
