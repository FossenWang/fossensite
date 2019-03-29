def add_github_url(*_):
    """
    Add 'github_url' field for old data,
    since old version db don't have 'github_url' field.
    """
    from account.models import Profile
    from tools.base import update_model
    ps = Profile.objects.select_related('user').all()
    for p in ps:
        if not p.github_url:
            update_model(p, **{'github_url': 'https://github.com/' + p.user.username})
