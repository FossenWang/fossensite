import traceback, random, time

from cronjob import setup_django, run, format_results, send_email

def main():
    time.sleep(random.random() * 3600)
    setup_django()
    result = run('/usr/fossen/website/certbot-auto renew')
    if 'Cert not yet due for renewal' in result.stdout:
        return 0

    try:
        result.check_returncode()
    except Exception:
        message = '续期SSL证书时发生了错误！\n\n' + traceback.format_exc() + '\n'
    else:
        message = 'SSL证书已续期\n'

    send_email('www.fossen.cn | 续期SSL证书', message + format_results([result]))

main()
