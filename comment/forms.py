from django.forms import ModelForm, HiddenInput

from .models import ArticleComment, ArticleCommentReply

class ArticleCommentForm(ModelForm):
    class Meta:
        model = ArticleComment
        fields = ['content', 'article']
        widgets = {
            'article': HiddenInput,
        }

class ArticleCommentReplyForm(ModelForm):
    class Meta:
        model = ArticleCommentReply
        fields = ['content', 'comment', 'reply']
        widgets = {
            'comment': HiddenInput,
            'reply': HiddenInput,
        }
