from django.views.generic import TemplateView



class TestView(TemplateView):
    '小程序测试视图'
    template_name = 'foodmap/test.html'
