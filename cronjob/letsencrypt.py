import random
import time
import traceback

from tools import prepare, send_email, setup_django, SubprocessManager


def main():
    time.sleep(random.random() * 3600)
    prepare()
    sp = SubprocessManager()
    sp.run('/home/fossen/certbot-auto --no-self-upgrade renew')
    if 'Cert not yet due for renewal' in sp.results[-1].stderr:
        return sp.format_results()

    try:
        for r in sp.results:
            r.check_returncode()
    except Exception:
        message = '续期SSL证书时发生了错误！\n\n' + traceback.format_exc() + '\n'
    else:
        message = 'SSL证书已续期\n'

    setup_django()
    message += sp.format_results()
    send_email('www.fossen.cn | 续期SSL证书', message)
    return message

if __name__ == "__main__":
    print(main())
