import os, subprocess
from django import setup
from django.core.mail import send_mail

def main():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fossensite.settings")
    setup()
    results = []
    try:
        results.append(run('git pull'))
        results[-1].check_returncode()
        if results[-1].stdout == 'Already up-to-date.\n':
            return 0

        results.append(run('python3 manage.py makemigrations'))
        results[-1].check_returncode()
        if results[-1].stdout != 'No changes detected\n':
            results.append(run('python3 manage.py migrate'))
            results[-1].check_returncode()

        results.append(run('apachectl restart'))
        results[-1].check_returncode()

    except Exception as e:
        message = '部署过程中发生了错误！\n' + str(e) + '\n'
    else:
        message = '部署完成\n'

    message += '\n——————详情——————\n'
    for r in results:
        message += '命令：' + str(r.args) + '\t返回码:' + str(r.returncode) \
        + '\n输出：' + str(r.stdout) + '\n错误：' + str(r.stderr) + '\n'
    send_mail(
        'www.fossen.cn自动部署结果',
        message[:-1],
        'admin@fossen.cn',
        ['fossen@fossen.cn']
    )#在setting.py中定义邮箱与密码

def run(args):
    return subprocess.run(args, stdout=-1, stderr=-1, encoding='utf-8', shell=True)

main()
