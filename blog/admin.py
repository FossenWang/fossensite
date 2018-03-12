from django.contrib import admin
from django.utils.html import format_html

from .models import Category, Topic, Article

class ViewOnSiteAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'html_url')
    def html_url(self, obj):
        return format_html('<a href="{}">在站点查看</a>', obj.get_absolute_url())
    html_url.short_description = 'url'

class TopicAdmin(ViewOnSiteAdmin):
    list_display = ('__str__', 'number', 'html_url')

class ArticleAdmin(ViewOnSiteAdmin):
    readonly_fields = ('author',)

    class Media:
        css = {'all':(
            'blog/css/simditor.css',
            'blog/css/simditor-html.css',
            'blog/css/simditor-markdown.css',
            )}
        js = (
            'https://cdn.bootcss.com/jquery/3.2.1/jquery.js',
            'https://cdn.bootcss.com/js-beautify/1.7.5/beautify-html.js',
            'https://cdn.bootcss.com/marked/0.3.12/marked.js',
            'https://cdn.bootcss.com/to-markdown/3.1.1/to-markdown.js',
            'blog/js/simditor/module.js',
            'blog/js/simditor/uploader.js',
            'blog/js/simditor/hotkeys.js',
            'blog/js/simditor/simditor.js',
            'blog/js/simditor/simditor-html.js',
            'blog/js/simditor/simditor-autosave.js',
            'blog/js/simditor/simditor-markdown.js',
            'blog/js/rich_text.js',
        )


admin.site.site_header = 'Fossen 管理'
admin.site.site_title = 'Fossen 站点管理员'

admin.site.register(Article, admin_class=ArticleAdmin)
admin.site.register(Topic, admin_class=TopicAdmin)
admin.site.register([Category])
