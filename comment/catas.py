from catalyst import Catalyst, StringField, IntegerField

from blog.models import Article


class CommentCatalyst(Catalyst):
    article_id = IntegerField()
    content = StringField(min_length=1, max_length=500, required=True)

    @article_id.set_validator
    def id_exists(article_id):
        assert Article.objects.filter(id=article_id).exists(), 'Article do not exists.'

comment_catalyst = CommentCatalyst()
