from django.apps import AppConfig


class CommentConfig(AppConfig):
    name = 'comment'
    verbose_name = '评论'

    def ready(self):
        from .signals import connect_signals
        connect_signals()
