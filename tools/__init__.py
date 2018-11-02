import os
import sys
import subprocess

from django import setup
from django.core.mail import send_mail


def prepare():
    os.chdir('/usr/fossen/website/fossensite')
    sys.path.append(os.getcwd())


def setup_django():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fossensite.settings")
    setup()


def run(args):
    return subprocess.run(args, stdout=-1, stderr=-1, encoding='utf-8', shell=True)


def format_results(results):
    message = '\n——————详情——————\n'
    for r in results:
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