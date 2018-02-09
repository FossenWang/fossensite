from django.views.generic.detail import DetailView
from django.views.generic.edit import CreateView
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm

from .models import Profile

class ProfileDetailView(DetailView):
    '用户资料视图'
    model = Profile
    template_name = 'account/profile.html'
    context_object_name = 'profile'

class UserCreateView(CreateView):
    model = User
    template_name = 'account/create_user.html'
    form_class = UserCreationForm
    success_url = '/registration/login/'
