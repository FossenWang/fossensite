from django.apps import AppConfig

from .base import bind_update_model, bind_json_to_request


class ToolsConfig(AppConfig):
    name = 'tools'

    def ready(self):
        bind_update_model()
        bind_json_to_request()
