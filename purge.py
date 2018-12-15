import traceback


from tools import setup_django, send_email, SubprocessManager, project_root, prepare


def main():
    prepare()
    sp = SubprocessManager()
    results = sp.results

    sp.run('python3 manage.py clearsessions')
    # sp.run(f'rm {project_root}/caches/*')

    sp.run('ls /var/log/letsencrypt/')
    for log in results[-1].stdout.split('\n'):
        if log != 'letsencrypt.log' and log:
            sp.run('rm /var/log/letsencrypt/' + log)

    sp.run('ls /var/log/')
    for log in results[-1].stdout.split('\n'):
        if '-20' in log:
            sp.run('rm /var/log/' + log)

    try:
        for result in results:
            result.check_returncode()
    except Exception:
        message = '清理垃圾文件时发生了错误！\n\n' + traceback.format_exc() + '\n'
        error = True
    else:
        message = '垃圾文件已清理干净\n'
        error = False

    setup_django()
    message += sp.format_results()
    if error:
        send_email('www.fossen.cn | 清理垃圾文件', message)
    return message


if __name__ == "__main__":
    print(main())
