import traceback

from tools import project_root, setup_django, send_email, SubprocessManager


def main():
    sp = SubprocessManager()
    try:
        sp.run('git checkout master')
        sp.run('git pull origin master')
        results = sp.results
        results[-1].check_returncode()
        if 'Already up' in results[-1].stdout:
            #no need to continue
            message = sp.format_results()
            print(message)
            return message

        sp.run('docker restart fossensite')
        if results[-1].returncode:
            error_result = results[-1]
            sp.run('docker inspect -f {{.State.Status}} fossensite')

            if 'running' not in results[-1].stdout:
                sp.run('git reset --hard HEAD^')
                sp.run('docker restart fossensite')
                sp.run('docker inspect -f {{.State.Status}} fossensite')

            # raise error
            error_result.check_returncode()

        sp.run(f'chown -R 1000:1000 {project_root}')

    except Exception:
        message = '部署过程中发生了错误！\n\n' + traceback.format_exc() + '\n'
    else:
        message = '部署完成\n'

    setup_django()
    message += sp.format_results()
    print(message)
    send_email('www.fossen.cn | 自动部署结果', message)
    return message


if __name__ == "__main__":
    print(main())
