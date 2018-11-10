from django.apps import AppConfig

from .views import bind_json_to_request


class ToolsConfig(AppConfig):
    name = 'tools'

    def ready(self):
        bind_json_to_request()
