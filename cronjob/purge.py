import traceback

from cronjob import prepare, setup_django, run, format_results, send_email


def main():
    prepare()
    results = []

    results.append(run('python3 manage.py clearsessions'))
    results.append(run('rm /usr/fossen/website/fossensite/caches/*'))

    results.append(run('ls /var/log/letsencrypt/'))
    for log in results[-1].stdout.split('\n'):
        if log != 'letsencrypt.log' and log:
            results.append(run('rm /var/log/letsencrypt/' + log))

    results.append(run('ls /var/log/httpd/'))
    for log in results[-1].stdout.split('\n'):
        if '-20' in log:
            results.append(run('rm /var/log/httpd/' + log))

    results.append(run('ls /var/log/'))
    for log in results[-1].stdout.split('\n'):
        if '-20' in log:
            results.append(run('rm /var/log/' + log))

    try:
        for result in results:
            result.check_returncode()
    except Exception:
        message = '清理垃圾文件时发生了错误！\n\n' + traceback.format_exc() + '\n'
    else:
        message = '垃圾文件已清理干净\n'

    setup_django()
    message += format_results(results)
    send_email('www.fossen.cn | 清理垃圾文件', message)
    return message

if __name__ == "__main__":
    print(main())
