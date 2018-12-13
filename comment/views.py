from django.db.models import Q, Value, IntegerField
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin, AccessMixin
from django.contrib.auth.models import User

from tools.views import ListView, CreateMixin, JSONView, DeletionMixin, SingleObjectMixin
from blog.models import Article

from .models import ArticleComment, ArticleCommentReply


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
    json_only = True
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


class PostLoginRequiredMixin(AccessMixin):
    raise_exception = True

    def post(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return self.handle_no_permission()
        return super().post(request, *args, **kwargs)


class ArticleCommentView(PostLoginRequiredMixin, CreateMixin, ListView):
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
        data['totalCommentAndReply'] = self.get_both_count(
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

    def validate_data(self, data: dict):
        if not data:
            return False
        content = data.get('content')
        if not content or len(content) > 500:
            return False

        try:
            article_id = int(self.kwargs.get('article_id'))
        except Exception:
            return False
        if not Article.objects.filter(id=article_id).exists():
            return False
        return True

    def data_valid(self, data):
        user = self.request.user
        comment = ArticleComment.objects.create(
            content=data['content'], user=user, article_id=self.kwargs['article_id'])
        avatar = user.profile.avatar
        rsp_data = {
            'id': comment.id,
            'content': comment.content,
            'time': comment.time,
            'article_id': comment.article_id,
            'reply_list': [],
            'user': {
                'id': user.id,
                'username': user.username,
                'avatar': avatar.name if avatar else None,
                'github_url': user.profile.github_url,
            }
        }
        return rsp_data


class ArticleCommentReplyView(PostLoginRequiredMixin, CreateMixin, JSONView):

    def validate_data(self, data: dict):
        if not data:
            return False
        try:
            content = data.get('content')
            article_id = int(self.kwargs.get('article_id'))
            if not content or len(content) > 500:
                return False
            if not Article.objects.filter(id=article_id).exists():
                return False

            reply_id = data.get('reply_id')
            reply_id = int(reply_id) if reply_id is not None else reply_id

            if reply_id:
                self.reply_to = ArticleCommentReply.objects.get(id=reply_id)
                self.comment = self.reply_to.comment
            else:
                self.reply_to = None
                comment_id = int(data.get('comment_id'))
                self.comment = ArticleComment.objects.get(id=comment_id)

        except Exception:
            return False

        return True

    def data_valid(self, data):
        user = self.request.user
        comment_data = dict(
            content=data['content'], user_id=user.id, article_id=self.kwargs['article_id'],
            comment_id=self.comment.id, comment_user_id=self.comment.user_id
            )
        if self.reply_to:
            comment_data['reply_id'] = self.reply_to.id
            comment_data['reply_user_id'] = self.reply_to.user_id
        reply = ArticleCommentReply.objects.create(**comment_data)

        user_dict = {}
        user_dict[reply.user_id] = None
        user_dict[reply.comment_user_id] = None
        user_dict[reply.reply_user_id] = None
        user_dict = fetch_user_dict(user_dict)

        rsp_data = {
            'id': reply.id,
            'content': reply.content,
            'time': reply.time,
            'article_id': reply.article_id,
            'comment_id': reply.comment_id,
            'reply_id': reply.reply_id,
            'user': user_dict[reply.user_id],
            'comment_user': user_dict[reply.comment_user_id],
            'reply_user': user_dict[reply.reply_user_id],
        }
        return rsp_data


class CreatorTestMixin(UserPassesTestMixin):
    '验证发送请求的用户是否是评论创建者'
    raise_exception = True

    def test_func(self):
        if self.request.user.is_authenticated:
            self.object = self.get_object()
            is_creator = self.request.user.id == self.object.user_id
        else:
            is_creator = False
        return is_creator


class DeleteArticleCommentView(CreatorTestMixin, DeletionMixin, SingleObjectMixin, JSONView):
    model = ArticleComment


class DeleteArticleCommentReplyView(DeleteArticleCommentView):
    model = ArticleCommentReply
