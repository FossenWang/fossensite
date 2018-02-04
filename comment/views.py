from django.shortcuts import get_object_or_404
from django.views.generic.list import ListView
from django.views.generic.edit import BaseCreateView
from django.http import HttpResponseBadRequest
from django.urls import reverse, NoReverseMatch
from django.core.exceptions import ImproperlyConfigured

from .models import ArticleComment, ArticleCommentReply
from .forms import ArticleCommentForm, ArticleCommentReplyForm


class ArticleCommentView(ListView):
    '文章评论列表'
    model = ArticleComment
    # 前端使用Ajax请求评论数据，故该模板仅包含评论部分
    template_name = 'comment/article_comment.html'
    context_object_name = 'comment_list'
    paginate_by = 10
    ordering = '-time'

    def get_queryset(self):
        return super().get_queryset() \
        .filter(article_id=self.kwargs.get('article_pk')) \
        .select_related('user', 'user__profile') \
        .only('content', 'time', 'user__username', 'user__profile__avatar')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        comments = context['comment_list']

        if self.request.user.is_authenticated and context["page_obj"].number == 1:
            context['form'] = ArticleCommentForm({
                'user': self.request.user.id,
                'article': self.kwargs['article_pk']
                })
        else:
            context['article_pk'] = self.kwargs['article_pk']

        first_num = context["paginator"].count - \
            self.paginate_by * (context["page_obj"].number - 1)
        last_num = first_num - comments.count()

        replies = ArticleCommentReply.objects.filter(comment_id__in=[c.id for c in comments]) \
        .select_related('user', 'user__profile', 'reply__user') \
        .only('content', 'time', 'user__username', 'user__profile__avatar', 'reply__user__username') \
        .order_by('time')

        context['comment_list'] = zip(
            range(first_num, last_num, -1),
            comments,
            [[r for r in replies if r.comment.id == c.id] for c in comments])
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

    def render_to_response(self, context, **response_kwargs):
        'Deny get method & post method with invalid form.'
        return HttpResponseBadRequest('Deny get method & post method with invalid form.')

class CreateArticleCommentReplyView(CreateArticleCommentView):
    '创建一条新的文章二级评论，只接受POST请求'
    model = ArticleCommentReply
    context_object_name = 'article_comment_reply'
    form_class = ArticleCommentReplyForm
