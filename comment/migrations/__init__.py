def fill_in_fk(*_):
    """
    Fill in new ForeignKey fields for old data.
    """
    from comment.models import ArticleCommentReply
    from tools.base import update_model
    rs = ArticleCommentReply.objects.all()
    for r in rs:
        update_values = {'article_id': r.comment.article_id, 'comment_user_id': r.comment.user_id}
        if r.reply_id is not None:
            update_values['reply_user_id'] = r.reply.user_id
        update_model(r, **update_values)
