from django.urls import path
from . import views

app_name = 'foodmap'

urlpatterns = [
    path('', views.TestView.as_view(), name='test'),
    path('test/', views.TestView.as_view(), name='test'),
]
