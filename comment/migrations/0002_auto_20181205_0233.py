# Generated by Django 2.1.3 on 2018-12-04 18:33

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion

from . import fill_in_fk

# def migrate_data(apps, schema_editor):
#     from comment.models import ArticleComment, ArticleCommentReply
#     from tools.base import update_model
#     rs = ArticleCommentReply.objects.all()
#     for r in rs:
#         update_values = {'article_id': r.comment.article_id, 'comment_user_id': r.comment.user_id}
#         if r.reply_id is not None:
#             update_values['reply_user_id'] = r.reply.user_id
#         update_model(r, **update_values)


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('comment', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='articlecommentreply',
            name='article',
            field=models.ForeignKey(default=2, on_delete=django.db.models.deletion.CASCADE, related_name='replies', to='blog.Article', verbose_name='评论文章'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='articlecommentreply',
            name='comment_user',
            field=models.ForeignKey(default=2, on_delete=django.db.models.deletion.CASCADE, related_name='+', to=settings.AUTH_USER_MODEL, verbose_name='一级评论者'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='articlecommentreply',
            name='reply_user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='+', to=settings.AUTH_USER_MODEL, verbose_name='二级评论者'),
        ),
        migrations.AlterField(
            model_name='articlecommentreply',
            name='comment',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='+', to='comment.ArticleComment', verbose_name='一级评论'),
        ),
        migrations.AlterField(
            model_name='articlecommentreply',
            name='reply',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='+', to='comment.ArticleCommentReply', verbose_name='二级评论'),
        ),
        migrations.RunPython(fill_in_fk),
    ]
