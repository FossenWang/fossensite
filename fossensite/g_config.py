import multiprocessing

# cd ~/Fossensite
# source f-venv/bin/activate
# cd ~/Fossensite/fossensite
# gunicorn -c python:fossensite.g_config fossensite.wsgi


bind = "127.0.0.1:8000"
workers = multiprocessing.cpu_count() * 2 + 1
accesslog = '-' #'../log/access.log'
errorlog = '-' #'../log/error.log'
daemon = False
