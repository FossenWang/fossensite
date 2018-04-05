import traceback, random, time

from cronjob import prepare, setup_django, run, format_results, send_email


def main():
    time.sleep(random.random() * 3600)
    prepare()
    results = []
    results.append(run('/usr/fossen/website/certbot-auto --no-self-upgrade renew'))
    if 'Cert not yet due for renewal' in results[-1].stderr:
        return results[-1].stdout + results[-1].stderr

    try:
        for r in results:
            r.check_returncode()
    except Exception:
        message = '续期SSL证书时发生了错误！\n\n' + traceback.format_exc() + '\n'
    else:
        message = 'SSL证书已续期\n'

    setup_django()
    message += format_results(results)
    send_email('www.fossen.cn | 续期SSL证书', message)
    return message

if __name__ == "__main__":
    print(main())
