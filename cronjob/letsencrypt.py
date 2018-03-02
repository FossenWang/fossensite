import traceback, random, time

from cronjob import prepare, setup_django, run, format_results, send_email


def main():
    time.sleep(random.random() * 3600)
    prepare()
    result = run('/usr/fossen/website/certbot-auto renew')
    if 'Cert not yet due for renewal' in result.stderr:
        return 0

    try:
        result.check_returncode()
    except Exception:
        message = '续期SSL证书时发生了错误！\n\n' + traceback.format_exc() + '\n'
    else:
        message = 'SSL证书已续期\n'

    setup_django()
    send_email('www.fossen.cn | 续期SSL证书', message + format_results([result]))

main()
