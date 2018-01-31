from django.views.generic import DetailView

from .models import Profile

class ProfileDetailView(DetailView):
    '用户资料视图'
    model = Profile
    template_name = 'account/profile.html'
    context_object_name = 'profile'
