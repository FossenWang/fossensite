#!/usr/bin/env python
import os
import sys

from fossensite import settings

if __name__ == "__main__":
    args = sys.argv
    if len(args) > 1 and sys.argv[1] == 'test':
        settings.DATABASES = settings.DevConfig.TEST_DATABASES
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fossensite.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)
