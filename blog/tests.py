from datetime import datetime
from django.test import TestCase
from django.contrib.auth.models import User


from account.models import Profile
from .models import Article, Category, Topic, Link


class BlogTestCase(TestCase):
    def setUp(self):
        User.objects.create_superuser('admin', 'admin@fossne.cn', 'admin')
        user = User.objects.create_user('Fossen', 'fossen@fossen.cn', 'fossen')
        Profile.objects.create(user=user, avatar=None, github_id=1,
                               github_url='https://github.com/FossenWang')
        Category.objects.create(name='cate1', number=1)
        self.t1 = Topic.objects.create(name='topic1', number=1)
        Link.objects.create(name='link1', url='www.fossen.cn')
        self.client.defaults = {'HTTP_ACCEPT': 'application/json'}

    def test_article_list(self):
        c = self.client
        rsp = c.get('/')
        self.assertEqual(rsp.status_code, 200)
        self.assertEqual(rsp.json()['data'], [])
        rsp = c.get('/article/')
        self.assertEqual(rsp.status_code, 200)
        self.assertEqual(rsp.json()['data'], [])
        rsp = c.get('/article/?page=10')
        self.assertEqual(rsp.status_code, 404)

        a1 = Article.objects.create(**{
            'title': 'title',
            'content': 'content',
            'pub_date': datetime.utcnow(),
            'category_id': 1,
        })
        a1.topics.add(self.t1)

        rsp = c.get('/article/')
        self.assertEqual(rsp.status_code, 200)
        r = rsp.json()
        aid = r['data'][0]['id']
        self.assertEqual(set(r['data'][0]), {
            'cover', 'views', 'pub_date', 'content',
            'title', 'id', 'category', 'topics'})
        self.assertEqual(set(r['data'][0]['category']), {
            'id', 'name'})
        self.assertEqual(set(r['data'][0]['topics'][0]), {
            'id', 'name'})
        self.assertDictEqual(r['pageInfo'], {
            'lastPage': 1, 'page': 1, 'pageSize': 10, 'total': 1})

        rsp = c.get(f'/article/{aid}/')
        self.assertEqual(rsp.status_code, 200)
        r = rsp.json()
        self.assertEqual(set(r), {
            'cover', 'views', 'pub_date', 'content',
            'title', 'id', 'category', 'topics'})
        self.assertEqual(set(r['category']), {'id', 'name'})
        self.assertEqual(set(r['topics'][0]), {'id', 'name'})

        rsp = c.get('/article/category/1/')
        self.assertEqual(rsp.status_code, 200)
        self.assertDictEqual(rsp.json()['pageInfo'], {
            'lastPage': 1, 'page': 1, 'pageSize': 10, 'total': 1})

        rsp = c.get('/article/topic/1/')
        self.assertEqual(rsp.status_code, 200)
        self.assertDictEqual(rsp.json()['pageInfo'], {
            'lastPage': 1, 'page': 1, 'pageSize': 10, 'total': 1})

        # test cate & topic & link
        rsp = c.get('/category/')
        self.assertEqual(rsp.status_code, 200)
        self.assertEqual(set(rsp.json()['data'][0]), {
            'id', 'name'})

        rsp = c.get('/topic/')
        self.assertEqual(rsp.status_code, 200)
        self.assertEqual(set(rsp.json()['data'][0]), {
            'id', 'name'})

        rsp = c.get('/link/')
        self.assertEqual(rsp.status_code, 200)
        self.assertEqual(set(rsp.json()['data'][0]), {
            'id', 'name', 'url'})
