from django.views.generic.list import ListView
from django.views.generic.edit import BaseCreateView, BaseDeleteView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.http import HttpResponseBadRequest, HttpResponseNotAllowed
from django.urls import reverse, NoReverseMatch
from django.core.exceptions import ImproperlyConfigured, PermissionDenied

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
        .filter(article_id=self.kwargs['article_id']) \
        .select_related('user', 'user__profile') \
        .only('content', 'time', 'user__username', 'user__profile__avatar')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        comments = context['comment_list']

        if self.request.user.is_authenticated and context["page_obj"].number == 1:
            context['form'] = ArticleCommentForm({'article': self.kwargs['article_id']})
        else:
            context['article_id'] = self.kwargs['article_id']

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
        return super().form_valid(form)

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
