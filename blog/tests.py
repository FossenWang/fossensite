from io import BytesIO

from django.core.files.storage import default_storage
from django.utils import timezone
from django.test import TestCase
from django.contrib.auth.models import User

from account.models import Profile
from .models import Article, Category, Topic, Link
from .admin import ViewOnSiteAdmin


class BlogTestCase(TestCase):
    def setUp(self):
        User.objects.create_superuser('admin', 'admin@fossne.cn', 'admin')
        user = User.objects.create_user('Fossen', 'fossen@fossen.cn', 'fossen')
        Profile.objects.create(user=user, avatar=None, github_id=1,
                               github_url='https://github.com/FossenWang')
        self.cate = Category.objects.create(name='cate1', number=1)
        self.topic = Topic.objects.create(name='topic1', number=1)
        self.link = Link.objects.create(name='link1', url='www.fossen.cn')
        self.client.defaults = {'HTTP_ACCEPT': 'application/json'}

    def test_api(self):
        self._test_model()
        self._test_admin()

        c = self.client
        rsp = c.get('/api/')
        self.assertEqual(rsp.status_code, 200)
        self.assertEqual(rsp.json()['data'], [])
        rsp = c.get('/api/article/')
        self.assertEqual(rsp.status_code, 200)
        self.assertEqual(rsp.json()['data'], [])
        rsp = c.get('/api/article/?page=10')
        self.assertEqual(rsp.status_code, 404)

        a1 = Article.objects.create(**{
            'title': 'title',
            'content': 'content',
            'pub_date': timezone.now(),
            'category_id': 1,
        })
        a1.topics.add(self.topic)
        self._test_article_model(a1)

        rsp = c.get('/api/article/')
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

        rsp = c.get(f'/api/article/{aid}/')
        self.assertEqual(rsp.status_code, 200)
        r = rsp.json()
        self.assertEqual(set(r), {
            'cover', 'views', 'pub_date', 'content',
            'title', 'id', 'category', 'topics'})
        self.assertEqual(set(r['category']), {'id', 'name'})
        self.assertEqual(set(r['topics'][0]), {'id', 'name'})

        rsp = c.get('/api/article/category/1/')
        self.assertEqual(rsp.status_code, 200)
        self.assertDictEqual(rsp.json()['pageInfo'], {
            'lastPage': 1, 'page': 1, 'pageSize': 10, 'total': 1})

        rsp = c.get('/api/article/topic/1/')
        self.assertEqual(rsp.status_code, 200)
        self.assertDictEqual(rsp.json()['pageInfo'], {
            'lastPage': 1, 'page': 1, 'pageSize': 10, 'total': 1})

        rsp = c.get('/api/article/search/?q=python  django')
        self.assertEqual(rsp.status_code, 200)
        r = rsp.json()
        self.assertListEqual(r['data'], [])
        self.assertDictEqual(r['pageInfo'], {
            'lastPage': 1, 'page': 1, 'pageSize': 10, 'total': 0})

        rsp = c.get('/api/article/search/?q=title')
        self.assertEqual(rsp.status_code, 200)
        self.assertDictEqual(rsp.json()['pageInfo'], {
            'lastPage': 1, 'page': 1, 'pageSize': 10, 'total': 1})

        rsp = c.get('/api/article/search/?q=%s' % ('x' * 89))
        self.assertEqual(rsp.status_code, 403)

        # test cate & topic & link
        rsp = c.get('/api/category/')
        self.assertEqual(rsp.status_code, 200)
        self.assertEqual(set(rsp.json()['data'][0]), {
            'id', 'name'})

        rsp = c.get('/api/topic/')
        self.assertEqual(rsp.status_code, 200)
        self.assertEqual(set(rsp.json()['data'][0]), {
            'id', 'name'})

        rsp = c.get('/api/link/')
        self.assertEqual(rsp.status_code, 200)
        self.assertEqual(set(rsp.json()['data'][0]), {
            'id', 'name', 'url'})

        # test upload
        rsp = c.get('/api/article/upload/image/')
        self.assertEqual(rsp.status_code, 403)

        rsp = c.post('/api/article/upload/image/', {'upload_image': None})
        self.assertEqual(rsp.status_code, 200)
        self.assertDictEqual(rsp.json(), {
            'file_path': '', 'msg': 'Unexpected File Format!', 'success': False})

        # create file-like object for test
        img = BytesIO(b'Pretend this is a picture.')
        img.name = 'test.jpg'
        # upload test file
        rsp = c.post('/api/article/upload/image/', {'upload_image': img})
        self.assertEqual(rsp.status_code, 200)
        result = rsp.json()
        self.assertEqual(set(result), {'file_path', 'success', 'msg'})
        self.assertTrue(result['success'])
        file_location = result['file_path'].lstrip('/media/')
        self.assertTrue(default_storage.exists(file_location))
        # remove test file
        default_storage.delete(file_location)

    def _test_model(self):
        self.assertEqual(str(self.cate), 'cate1')
        self.assertEqual(self.cate.get_absolute_url(),
                         f'/api/article/category/{self.cate.pk}/')

        self.assertEqual(str(self.topic), 'topic1')
        self.assertEqual(self.topic.get_absolute_url(),
                         f'/api/article/topic/{self.topic.pk}/')

        self.assertEqual(str(self.link), 'link1')

    def _test_article_model(self, article: Article):
        self.assertEqual(str(article), article.title)
        self.assertEqual(article.get_absolute_url(),
                         f'/api/article/{article.pk}/')

    def _test_admin(self):
        self.assertEqual(
            ViewOnSiteAdmin.html_url(None, self.topic),
            f'<a href="/api/article/topic/{self.topic.pk}/">在站点查看</a>')
