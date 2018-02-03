from django.forms import ModelForm, HiddenInput

from .models import ArticleComment, ArticleCommentReply

class ArticleCommentForm(ModelForm):
    class Meta:
        model = ArticleComment
        fields = ['content', 'user', 'article']
        widgets = {
            'user': HiddenInput,
            'article': HiddenInput,
        }

class ArticleCommentReplyForm(ModelForm):
    class Meta:
        model = ArticleCommentReply
        fields = ['content', 'user', 'comment', 'reply']
        widgets = {
            'user': HiddenInput,
            'comment': HiddenInput,
            'reply': HiddenInput,
        }
