import os, subprocess, traceback
from django import setup
from django.core.mail import send_mail

def main():
    os.chdir('/usr/fossen/website/fossensite')
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fossensite.settings")
    setup()
    results = []
    try:
        results.append(run('git pull'))
        results[-1].check_returncode()
        if results[-1].stdout == 'Already up-to-date.\n':
            #no need to continue
            return 0

        results.append(run('python3 manage.py makemigrations'))
        results[-1].check_returncode()
        if results[-1].stdout != 'No changes detected\n':
            results.append(run('python3 manage.py migrate'))
            results[-1].check_returncode()

        results.append(run('apachectl restart'))
        if results[-1].returncode:
            error_result = results[-1]
            results.append(run('apachectl status'))
            if 'Active: active (running)' not in results[-1].stdout:
                results.append(run('git reset --hard HEAD^'))
                results.append(run('apachectl restart'))
            error_result.check_returncode()

    except Exception:
        message = '部署过程中发生了错误！\n\n' + traceback.format_exc() + '\n'
    else:
        message = '部署完成\n'

    results.append(run('chown -R fossen:root /usr/fossen/website/fossensite'))
    message += '\n——————详情——————\n'
    for r in results:
        message += '命令：{}    | 返回码:{}\n输出：{}\n错误：{}\n——————————————\n' \
        .format(str(r.args), str(r.returncode), str(r.stdout), str(r.stderr))
    send_mail(
        'www.fossen.cn自动部署结果',
        message[:-1],
        'admin@fossen.cn',
        ['fossen@fossen.cn']
    )#在setting.py中定义邮箱与密码

def run(args):
    return subprocess.run(args, stdout=-1, stderr=-1, encoding='utf-8', shell=True)

main()
