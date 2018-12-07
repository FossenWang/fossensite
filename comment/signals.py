from django.db.models import prefetch_related_objects
from django.db.models.signals import post_save
from django.contrib.auth.models import User

from .models import ArticleComment, ArticleCommentReply


def notify_user(sender, **kwargs):
    if not kwargs['created']:
        return
    if sender is ArticleComment:
        fossen = User.objects.select_related('profile').get(id=2)
        fossen.profile.get_new_notice()
    elif sender is ArticleCommentReply:
        reply = kwargs['instance']
        prefetch_related_objects(
            [reply], 'comment_user__profile', 'reply_user__profile')
        uid = reply.user.id
        c_user = reply.comment_user
        if c_user.id != uid:
            c_user.profile.get_new_notice()
        if reply.reply:
            r_user = reply.reply_user
            if r_user.id != uid:
                r_user.profile.get_new_notice()


def connect_signals():
    post_save.connect(notify_user, sender=ArticleComment, weak=False, dispatch_uid='comment_notification')
    post_save.connect(notify_user, sender=ArticleCommentReply, weak=False, dispatch_uid='reply_notification')
