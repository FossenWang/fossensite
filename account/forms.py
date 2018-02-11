from django.forms import ModelForm, HiddenInput

from django.contrib.auth.models import User
from django.contrib.auth.forms import UsernameField

class OauthEditUsernameForm(ModelForm):
    '第三方登录时修改重复用户名的表单'
    class Meta:
        model = User
        fields = ['username']
        field_classes = {'username': UsernameField}
