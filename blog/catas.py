from catalyst import (
    Catalyst, IntegerField, StringField, DatetimeField,
    NestField, ListField
)


class CategoryCatalyst(Catalyst):
    id = IntegerField()
    name = StringField()

cate_catalyst = CategoryCatalyst()


class TopicCatalyst(Catalyst):
    id = IntegerField()
    name = StringField()

topic_catalyst = TopicCatalyst()


class ArticleCatalyst(Catalyst):
    id = IntegerField()
    cover = StringField()
    views = IntegerField()
    pub_date = DatetimeField()
    content = StringField()
    title = StringField()
    category = NestField(cate_catalyst)
    topics = ListField(NestField(topic_catalyst))

    @topics.set_dump_from
    def dump_from_related_manager(article, name):
        return article.topics.all()


article_catalyst = ArticleCatalyst()


# def serialize_article(article):
    # result = {
    #     'id': article.id,
    #     'cover': article.cover.url if article.cover else None,
    #     'title': article.title,
    #     'content': article.content,
    #     'views': article.views,
    #     'pub_date': article.pub_date.isoformat(),
    #     'category': {
    #         'id': article.category.id,
    #         'name': article.category.name,
    #     },
    #     'topics': [{
    #         'id': t.id,
    #         'name': t.name,
    #     } for t in article.topics.all()],
    # }
    # return result
