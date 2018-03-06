from django.urls import re_path, include
from . import views

app_name = 'fitness'

urlpatterns = [
    re_path(r'^program-list/(?P<ptype_id>[0-9]+)$', views.ProgramListView.as_view(), name='program_list'),
    re_path(r'^program/(?P<pk>[0-9]+)$', views.ProgramDetailView.as_view(), name='program'),
    re_path(r'^program/(?P<pk>[0-9]+)/edit$', views.ProgramEditView.as_view(), name='program_edit'),
]
