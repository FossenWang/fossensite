from django.shortcuts import get_object_or_404
from django.views.generic.list import ListView
from django.views.generic.edit import BaseCreateView
from django.http import Http404, HttpResponseRedirect, HttpResponseBadRequest
from django.urls import reverse, NoReverseMatch
from django.core.exceptions import ImproperlyConfigured

from .models import ArticleComment, ArticleCommentReply
from .forms import ArticleCommentForm


class ArticleCommentView(ListView):
    '文章评论列表'
    model = ArticleComment
    # 前端使用Ajax请求评论数据，故该模板仅包含评论部分
    template_name = 'comment/article_comment.html'
    context_object_name = 'comment_list'
    paginate_by = 10
    ordering = '-time'

    def get_queryset(self):
        return super().get_queryset().filter(article_id=self.kwargs.get('article_pk'))

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        if self.request.user.is_authenticated and context["page_obj"].number == 1:
            context['form'] = ArticleCommentForm({
                'user': self.request.user.id,
                'article': self.kwargs['article_pk']
                })
        else:
            context['article_pk'] = self.kwargs['article_pk']

        context['replies_list'] = []
        for comment in context['comment_list']:
            replies = ArticleCommentReply.objects.filter(comment=comment)
            context['replies_list'].append(replies)

        first_num = context["paginator"].count - \
            self.paginate_by * (context["page_obj"].number - 1)
        last_num = first_num - len(context['comment_list'])
        context['comment_list'] = zip(
            range(first_num, last_num, -1),
            context['comment_list'],
            context['replies_list'])
        return context

class CreateArticleCommentView(BaseCreateView):
    '创建一条新的文章评论，只接受POST请求'
    model = ArticleComment
    context_object_name = 'article_comment'
    form_class = ArticleCommentForm

    def get_success_url(self):
        try:
            url = reverse('blog:detail', kwargs={'pk': self.request.POST['article']})
        except NoReverseMatch:
            raise ImproperlyConfigured('No URL to redirect to. Provide a success_url.')
        return url

    def get(self, request, *args, **kwargs):
        '禁止get方法'
        return HttpResponseBadRequest()

    def form_invalid(self, form):
        '不处理无效的表单'
        return HttpResponseBadRequest()
