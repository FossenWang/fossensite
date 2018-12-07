from django.views.generic.edit import BaseCreateView, BaseDeleteView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.http import HttpResponseBadRequest, HttpResponseNotAllowed, HttpResponseRedirect
from django.urls import reverse, NoReverseMatch
from django.db.models import Prefetch
from django.core.exceptions import ImproperlyConfigured
from django.core.cache import cache
from django.core.cache.utils import make_template_fragment_key
from django.db.models import Q, Value, IntegerField
from django.contrib.auth.models import User

from tools.views import ListView

from .models import ArticleComment, ArticleCommentReply
from .forms import ArticleCommentForm, ArticleCommentReplyForm


class EditArticleCommentMixin():
    '修改文章评论Mixin'

    def get_success_url(self):
        '操作成功后转向文章详情页'
        try:  # POST字典中必须提供文章的id
            url = reverse('blog:detail', kwargs={
                          'pk': self.request.POST['article']})
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
        pages = ArticleComment.objects.filter(
            article_id=article_id).count()//10 + 1
        for i in range(1, pages+1):
            cache.delete(make_template_fragment_key(
                'article_comment', [article_id, i]))


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


def fetch_user_dict(user_dict):
    # 查询user_dict中所有user并填充至dict中
    if None in user_dict:
        del user_dict[None]
    users = User.objects.filter(id__in=user_dict.keys()).values(
        'id', 'username', 'profile__avatar', 'profile__github_url')
    for user in users:
        user['avatar'] = user.pop('profile__avatar')
        user['github_url'] = user.pop('profile__github_url')
        user_dict[user['id']] = user
    user_dict[None] = None
    return user_dict


class UserReplyList(LoginRequiredMixin, ListView):
    '用户收到的回复列表'
    model = ArticleCommentReply
    template_name = 'index.html'
    context_object_name = 'replies'
    paginate_by = 10
    raise_exception = True
    none = Value(None, IntegerField())
    fields = ('id', 'content', 'time', 'user_id', 'article_id', 'article__title',
              'comment_id', 'comment_user_id', 'reply_id', 'reply_user_id')

    def get_queryset(self):
        uid = self.request.user.id
        q1 = ArticleCommentReply.objects \
            .filter(Q(comment_user_id=uid) | Q(reply_user_id=uid)) \
            .exclude(user=uid)

        if uid == 2:
            # 文章作者收到的评论
            none = self.none
            q2 = ArticleComment.objects \
                .annotate(comment_id=none, comment_user_id=none, reply_id=none, reply_user_id=none)
            q1 = q1.union(q2, all=True)

        q1 = q1.order_by('-time').values(*self.fields)
        self.request.user.profile.have_read_notice()
        return q1

    def serialize(self):
        data = super().serialize()
        reply_list = list(self.context['replies'])
        self.set_users(reply_list)
        data['data'] = reply_list
        return data

    def set_users(self, reply_list):
        user_dict = {}
        # 收集user id
        for item in reply_list:
            user_dict[item['user_id']] = None
            user_dict[item['comment_user_id']] = None
            user_dict[item['reply_user_id']] = None

        user_dict = fetch_user_dict(user_dict)

        # 将所有user_id换成user
        for reply in reply_list:
            reply['user'] = user_dict[reply.pop('user_id')]
            reply['comment_user'] = user_dict[reply.pop('comment_user_id')]
            reply['reply_user'] = user_dict[reply.pop('reply_user_id')]
        return reply_list


class ArticleCommentView(ListView):
    '文章评论列表'
    model = ArticleComment
    template_name = 'index.html'
    context_object_name = 'comments'
    paginate_by = 10

    def get_queryset(self):
        query = ArticleComment.objects \
            .filter(article_id=self.kwargs['article_id']).values()
        return query

    def serialize(self):
        data = super().serialize()
        article_id = self.kwargs['article_id']
        comment_list = list(self.context['comments'])
        self.set_related_data(comment_list)
        data['totalCount'] = self.get_both_count(
            article_id, data['pageInfo']['total'])
        data['data'] = comment_list
        return data

    def set_related_data(self, comment_list):
        comment_dict = {}
        user_dict = {}
        for comment in comment_list:
            # 创建回复列表，并将评论列表转为字典
            comment['reply_list'] = []
            comment_dict[comment['id']] = comment
            # 收集user id
            user_dict[comment['user_id']] = None

        reply_list = ArticleCommentReply.objects.filter(
            comment_id__in=comment_dict.keys()).values()
        for reply in reply_list:
            # 收集评论下的回复
            comment_dict[reply['comment_id']]['reply_list'].append(reply)
            # 收集user id
            user_dict[reply['user_id']] = None
            user_dict[reply['comment_user_id']] = None
            user_dict[reply['reply_user_id']] = None

        user_dict = fetch_user_dict(user_dict)

        # 将所有user_id换成user
        for comment in comment_list:
            comment['user'] = user_dict[comment.pop('user_id')]
        for reply in reply_list:
            reply['user'] = user_dict[reply.pop('user_id')]
            reply['comment_user'] = user_dict[reply.pop('comment_user_id')]
            reply['reply_user'] = user_dict[reply.pop('reply_user_id')]
        return comment_list

    def get_both_count(self, article_id, comment_count):
        if comment_count:
            q = ArticleCommentReply.objects.filter(article_id=article_id)
            reply_count = q.count()
        else:
            reply_count = 0
        return comment_count + reply_count
