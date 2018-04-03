from django.apps import AppConfig
from django.db.models.signals import post_save

class CommentConfig(AppConfig):
    name = 'comment'
    verbose_name = '评论'

    def ready(self):
        from django.contrib.auth.models import User
        ArticleComment = self.get_model('ArticleComment')
        ArticleCommentReply = self.get_model('ArticleCommentReply')

        def notify_user(sender, **kwargs):
            if not kwargs['created']:
                return
            if sender is ArticleComment:
                fossen = User.objects.select_related('profile').only('profile__new_notice').get(id=2)
                fossen.profile.get_new_notice()
            elif sender is ArticleCommentReply:
                reply = kwargs['instance']
                reply.comment.user.profile.get_new_notice()
                if reply.reply:
                    reply.reply.user.profile.get_new_notice()

        post_save.connect(notify_user, sender=ArticleComment, weak=False, dispatch_uid='comment_notification')
        post_save.connect(notify_user, sender=ArticleCommentReply, weak=False, dispatch_uid='reply_notification')
