from django.utils import timezone
from django.test import TestCase
from django.contrib.auth.models import User

from account.models import Profile
from blog.models import Article, Category, Topic, Link

from .models import ArticleComment, ArticleCommentReply
from .migrations import fill_in_fk

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

        self.a1 = a1
        self.user = user
        self.fossen = fossen
        self.client.defaults = {'HTTP_ACCEPT': 'application/json'}

    def _test_models_and_signals(self, user: User, fossen: User, a1: Article):
        'Create comments, test models and signals'
        self.assertFalse(user.profile.new_notice)
        self.assertFalse(fossen.profile.new_notice)

        c1 = ArticleComment.objects.create(
            content='c1', user=user, article=a1)
        self.assertTrue(c1.content.startswith(str(c1)))
        fossen.profile.refresh_from_db()
        self.assertTrue(fossen.profile.new_notice)
        fossen.profile.have_read_notice()

        r1 = ArticleCommentReply.objects.create(
            content='r1', user=fossen, article=a1, comment=c1, comment_user=c1.user)
        user.profile.refresh_from_db()
        self.assertTrue(user.profile.new_notice)
        user.profile.have_read_notice()

        r2 = ArticleCommentReply.objects.create(
            content='r2', user=user, article=a1, comment=c1, comment_user=c1.user,
            reply=r1, reply_user=r1.user)
        user.profile.refresh_from_db()
        self.assertFalse(user.profile.new_notice)

        ArticleCommentReply.objects.create(
            content='r3', user=fossen, article=a1, comment=c1, comment_user=c1.user,
            reply=r2, reply_user=r2.user)
        fossen.profile.refresh_from_db()
        self.assertTrue(fossen.profile.new_notice)
        fossen.profile.have_read_notice()

        # update no signal
        c1.content = 'comment'
        c1.save()
        fossen.profile.refresh_from_db()
        self.assertFalse(fossen.profile.new_notice)

    def test_comment(self):
        c = self.client
        c.login(username='user1', password='user1')

        rsp = c.get('/api/article/1/comment/')
        self.assertEqual(rsp.status_code, 200)
        self.assertEqual(rsp.json()['pageInfo']['total'], 0)

        # setup comments
        self._test_models_and_signals(self.user, self.fossen, self.a1)

        self.assertTrue(self.user.profile.new_notice, '有新通知')
        rsp = c.get('/api/account/notice/')
        self.assertEqual(rsp.status_code, 200)
        self.user.profile.refresh_from_db()
        self.assertFalse(self.user.profile.new_notice, '通知已读')
        r = rsp.json()
        self.assertEqual(set(r['data'][0]), {
            'reply_id', 'user', 'article_id', 'id', 'comment_user',
            'article__title', 'comment_id', 'reply_user', 'time', 'content'})
        user_fields = {'id', 'avatar', 'github_url', 'username'}
        self.assertEqual(set(r['data'][0]['user']), user_fields)
        self.assertEqual(set(r['data'][0]['comment_user']), user_fields)
        self.assertEqual(set(r['data'][0]['reply_user']), user_fields)
        self.assertEqual(set(r['pageInfo']), {'lastPage', 'page', 'pageSize', 'total'})

        rsp = c.get('/api/article/1/comment/')
        self.assertEqual(rsp.status_code, 200)
        r = rsp.json()
        self.assertEqual(set(r), {'data', 'pageInfo', 'totalCommentAndReply'})
        self.assertEqual(set(r['data'][0]), {
            'time', 'user', 'article_id', 'id', 'content', 'reply_list'})
        self.assertEqual(set(r['data'][0]['reply_list'][0]), {
            'reply_user', 'id', 'content', 'user', 'reply_id',
            'comment_user', 'time', 'comment_id', 'article_id'})
        user_fields = {'id', 'avatar', 'github_url', 'username'}
        self.assertEqual(set(r['data'][0]['user']), user_fields)
        self.assertEqual(set(r['data'][0]['reply_list'][1]['user']), user_fields)
        self.assertEqual(set(r['data'][0]['reply_list'][1]['comment_user']), user_fields)
        self.assertEqual(set(r['data'][0]['reply_list'][1]['reply_user']), user_fields)

        for i in range(2, 6):
            cm = ArticleComment.objects.create(content=f'c{i}', user=self.user, article=self.a1)
            for j in range(1, 6):
                ArticleCommentReply.objects.create(
                    content=f'r{j}', user=self.fossen, article=self.a1,
                    comment=cm, comment_user=cm.user)
        self.user.profile.refresh_from_db()
        self.assertTrue(self.user.profile.new_notice, '有新通知')

        rsp = c.get('/api/article/1/comment/')
        self.assertEqual(rsp.status_code, 200)
        r = rsp.json()
        # 一级评论为时间倒序
        self.assertTrue(r['data'][0]['id'] > r['data'][1]['id'])
        for comment in r['data']:
            # 二级评论为时间顺序
            self.assertTrue(comment['reply_list'][0]['id'] < comment['reply_list'][1]['id'])
            for reply in comment['reply_list']:
                self.assertEqual(reply['comment_id'], comment['id'])

        # 创建评论
        rsp = c.post('/api/article/1/comment/', {'content': 'new comment'}, 'application/json')
        self.assertEqual(rsp.status_code, 200)
        r = rsp.json()
        self.assertEqual(set(r), {
            'time', 'user', 'article_id', 'id', 'content', 'reply_list'})
        self.assertEqual(set(r['user']), user_fields)
        comment_id = r['id']

        # empty content
        rsp = c.post('/api/article/1/comment/', {'content': ''}, 'application/json')
        self.assertEqual(rsp.status_code, 403)
        # not json
        rsp = c.post('/api/article/1/comment/', {'content': 'new comment'})
        self.assertEqual(rsp.status_code, 403)
        # wrong article id
        rsp = c.post('/api/article/wrong_id/comment/', {'content': 'new comment'}, 'application/json')
        self.assertEqual(rsp.status_code, 404)
        rsp = c.post('/api/article/100/comment/', {'content': 'new comment'}, 'application/json')
        self.assertEqual(rsp.status_code, 404)

        # 创建回复
        rsp = c.post('/api/article/1/comment/reply/', {
            'content': 'new comment', 'comment_id': comment_id
            }, 'application/json')
        self.assertEqual(rsp.status_code, 200)
        r = rsp.json()
        self.assertEqual(set(r), {
            'reply_user', 'id', 'content', 'user', 'reply_id',
            'comment_user', 'time', 'comment_id', 'article_id'})
        self.assertEqual(r['comment_id'], comment_id)
        reply_id = r['id']

        rsp = c.post('/api/article/1/comment/reply/', {
            'content': 'new comment', 'comment_id': comment_id,
            'reply_id': reply_id,
            }, 'application/json')
        self.assertEqual(rsp.status_code, 200)
        r = rsp.json()
        self.assertEqual(r['reply_id'], reply_id)
        self.assertEqual(r['comment_id'], comment_id)

        # wrong id
        rsp = c.post('/api/article/1/comment/reply/', {
            'content': 'new comment', 'comment_id': comment_id,
            'reply_id': 100,
            }, 'application/json')
        self.assertEqual(rsp.status_code, 403)
        rsp = c.post('/api/article/1/comment/reply/', {
            'content': 'new comment', 'comment_id': 100,
            }, 'application/json')
        self.assertEqual(rsp.status_code, 403)
        # empty data
        rsp = c.post('/api/article/1/comment/reply/', {}, 'application/json')
        self.assertEqual(rsp.status_code, 403)
        # empty content
        rsp = c.post('/api/article/1/comment/reply/', {
            'content': '', 'comment_id': comment_id
            }, 'application/json')
        self.assertEqual(rsp.status_code, 403)
        # wrong article id
        rsp = c.post('/api/article/100/comment/reply/', {
            'content': 'new comment', 'comment_id': comment_id
            }, 'application/json')
        self.assertEqual(rsp.status_code, 404)

        # 删除评论
        rsp = c.delete(f'/api/article/reply/{reply_id}/')
        self.assertEqual(rsp.status_code, 204)
        rsp = c.delete(f'/api/article/comment/{comment_id}/')
        self.assertEqual(rsp.status_code, 204)
        # 不能删除别人的评论
        rsp = c.delete(f'/api/article/reply/{1}/')
        self.assertEqual(rsp.status_code, 403)

        # 测试作者账号
        c.force_login(self.fossen)
        # 测试数据库用的 sqllite 不支持复杂语句排序
        rsp = c.get('/api/account/notice/')
        self.assertEqual(rsp.status_code, 400)

        # 注销
        c.logout()
        rsp = c.post('/api/article/1/comment/')
        self.assertEqual(rsp.status_code, 403)

        rsp = c.delete(f'/api/article/comment/{1}/')
        self.assertEqual(rsp.status_code, 403)

        self._test_fill_in_fk()

    def _test_fill_in_fk(self):
        fill_in_fk()
