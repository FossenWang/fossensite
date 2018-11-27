from datetime import datetime
from django.test import TestCase, Client

from .models import Category, Topic, Article


class BlogTestCase(TestCase):
    def setUp(self):
        Category.objects.create(name='cate1', number=1)
        self.t1 = Topic.objects.create(name='topic1', number=1)
        self.c = Client(HTTP_ACCEPT='application/json')

    def test_article_list(self):
        c = self.c
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
        self.assertEqual(set(r['data'][0]), {
            'cover', 'views', 'pub_date', 'content',
            'title', 'id', 'category', 'topics'})
        self.assertEqual(set(r['data'][0]['category']), {
            'id', 'name'})
        self.assertEqual(set(r['data'][0]['topics'][0]), {
            'id', 'name'})
        self.assertDictEqual(r['pageInfo'], {
            'lastPage': 1, 'page': 1, 'pageSize': 10, 'total': 1})

        rsp = c.get('/article/category/1/')
        self.assertEqual(rsp.status_code, 200)
        self.assertDictEqual(rsp.json()['pageInfo'], {
            'lastPage': 1, 'page': 1, 'pageSize': 10, 'total': 1})

        rsp = c.get('/article/topic/1/')
        self.assertEqual(rsp.status_code, 200)
        self.assertDictEqual(rsp.json()['pageInfo'], {
            'lastPage': 1, 'page': 1, 'pageSize': 10, 'total': 1})

        # test cate & topic
        rsp = c.get('/category/')
        self.assertEqual(rsp.status_code, 200)
        self.assertEqual(set(rsp.json()['data'][0]), {
            'id', 'name'})

        rsp = c.get('/topic/')
        self.assertEqual(rsp.status_code, 200)
        self.assertEqual(set(rsp.json()['data'][0]), {
            'id', 'name'})
