from django.contrib import admin

from .models import Category, Topic, Article

class ArticleAdmin(admin.ModelAdmin):
    readonly_fields = ('author',)#'views',)
    class Media:
        css = {'all':(
            'http://simditor.tower.im/assets/styles/simditor.css',
            'blog/css/simditor-html.css',
            )}
        js = (
            'https://cdn.bootcss.com/jquery/3.2.1/jquery.js',
            'https://cdn.bootcss.com/js-beautify/1.7.5/beautify-html.js',
            'blog/js/simditor/module.js',
            'blog/js/simditor/uploader.js',
            'blog/js/simditor/hotkeys.js',
            'blog/js/simditor/simditor.js',
            'blog/js/simditor/simditor-html.js',
            'blog/js/simditor/simditor-autosave.js',
            'blog/js/textarea.js',
        )

admin.site.site_header = 'Fossen 管理'
admin.site.site_title = 'Fossen 站点管理员'
admin.site.index_title = '站点管理'

admin.site.register(Article, admin_class=ArticleAdmin)
admin.site.register([Topic, Category])
