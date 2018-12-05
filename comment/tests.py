from django.utils import timezone
from django.test import TestCase
from django.contrib.auth.models import User

from account.models import Profile
from blog.models import Article, Category, Topic, Link
from .models import ArticleComment, ArticleCommentReply


class CommentTestCase(TestCase):
    def setUp(self):
        User.objects.create_superuser('admin', 'admin@fossne.cn', 'admin')
        fossen = User.objects.create_user(
            'Fossen', 'fossen@fossen.cn', 'fossen')
        Profile.objects.create(user=fossen, avatar=None, github_id=1,
                               github_url='https://github.com/FossenWang')
        user = User.objects.create_user('user1', 'user@fossen.cn', 'user1')
        Profile.objects.create(user=user, avatar=None, github_id=2,
                               github_url='https://github.com/FossenWang')
        Category.objects.create(name='cate1', number=1)
        t1 = Topic.objects.create(name='topic1', number=1)
        Link.objects.create(name='link1', url='www.fossen.cn')
        a1 = Article.objects.create(**{
            'title': 'title',
            'content': 'content',
            'pub_date': timezone.now(),
            'category_id': 1,
        })
        a1.topics.add(t1)
        c1 = ArticleComment.objects.create(
            content='c1', user=user, article=a1)
        r1 = ArticleCommentReply.objects.create(
            content='r1', user=fossen, article=a1, comment=c1, comment_user=c1.user)
        r2 = ArticleCommentReply.objects.create(
            content='r2', user=user, article=a1, comment=c1, comment_user=c1.user,
            reply=r1, reply_user=r1.user)
        r3 = ArticleCommentReply.objects.create(
            content='r3', user=fossen, article=a1, comment=c1, comment_user=c1.user,
            reply=r2, reply_user=r2.user)

        self.client.defaults = {'HTTP_ACCEPT': 'application/json'}

    def test_comment(self):
        c = self.client
        c.login(username='user1', password='user1')

        rsp = c.get('/account/notice/')
        self.assertEqual(rsp.status_code, 200)
        r = rsp.json()
        self.assertEqual(set(r['data'][0]), {
            'reply_id', 'user', 'article_id', 'id', 'comment_user',
            'article__title', 'comment_id', 'reply_user', 'time', 'content'})
        self.assertEqual(set(r['data'][0]['user']), {'username', 'id', 'avatar', 'github_url'})
        self.assertEqual(set(r['data'][0]['comment_user']), {'username', 'id', 'avatar', 'github_url'})
        self.assertEqual(set(r['data'][0]['reply_user']), {'username', 'id', 'avatar', 'github_url'})
        self.assertEqual(set(r['pageInfo']), {'lastPage', 'page', 'pageSize', 'total'})

        # from pprint import pprint
        # pprint(rsp.json())
