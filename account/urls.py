from django.conf.urls import re_path

from . import views

app_name = 'account'

urlpatterns = [
    re_path(r'^profile/$', views.ProfileDetailView.as_view(), name='profile'),
]