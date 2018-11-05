#!/bin/bash
pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/
gunicorn -c python:fossensite.g_config fossensite.wsgi
