import os
import sys
import subprocess

from django import setup
from django.core.mail import send_mail
from django.db.models import Model

from fossensite.settings import BASE_DIR


project_root = BASE_DIR


def prepare():
    os.chdir(BASE_DIR)
    sys.path.append(os.getcwd())


def setup_django():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fossensite.settings")
    setup()


class SubprocessManager:
    def __init__(self):
        self.results = []

    def run(self, args):
        r = subprocess.run(args, stdout=-1, stderr=-1, encoding='utf-8', shell=True)
        self.results.append(r)
        return r

    def format_results(self):
        message = '\n——————详情——————\n'
        for r in self.results:
            message += '命令：{}    | code:{}\nstdout：{}\nstderr：{}\n——————————————\n' \
                .format(str(r.args), str(r.returncode), str(r.stdout), str(r.stderr))
        return message[:-1]


def send_email(title, message):
    send_mail(
        title,
        message,
        'admin@fossen.cn',
        ['fossen@fossen.cn']
    )  # 在setting.py中定义邮箱与密码


def update_model(model: Model, update_data: dict):
    '根据内容改变与否判断需要更新的模型字段'
    update_fields = []
    for field in update_data:
        if update_data[field] != getattr(model, field):
            setattr(model, field, update_data[field])
            update_fields.append(field)
    if update_fields:
        model.save(update_fields=update_fields)
