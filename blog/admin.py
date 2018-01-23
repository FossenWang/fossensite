from django.contrib import admin

from .models import Category, Topic, Article

class ArticleAdmin(admin.ModelAdmin):

    class Media:
        # 在管理后台的HTML文件中加入js文件, 每一个路径都会追加STATIC_URL/
        js = (
            'https://cdn.bootcss.com/jquery/3.2.1/jquery.js',
            'http://apps.bdimg.com/libs/ueditor/1.4.3.1/ueditor.config.js',
            'http://apps.bdimg.com/libs/ueditor/1.4.3.1/ueditor.all.js',
            'blog/js/textarea.js',
        )

admin.site.register(Article, admin_class=ArticleAdmin)
admin.site.register([Topic, Category])
