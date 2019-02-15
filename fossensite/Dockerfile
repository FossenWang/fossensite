FROM python:3.7

LABEL maintainer="Fossen"

EXPOSE 8000
VOLUME [ "/home/fossen/Fossensite" ]
WORKDIR /home/fossen/Fossensite/fossensite
CMD pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/;\
gunicorn -c python:fossensite.g_config fossensite.wsgi


# sudo docker build -t fossensite /home/fossen/Fossensite/fossensite/fossensite
# sudo docker run -d --network host --restart=always --name fossensite -v /home/fossen/Fossensite:/home/fossen/Fossensite fossensite
# sudo docker restart fossensite

# sudo docker run -d --network host --restart=always --name fossensite-deploy \
# -v /bin/docker:/bin/docker -v /run/docker.sock:/run/docker.sock \
# -v /home/fossen/Fossensite:/home/fossen/Fossensite fossensite \
# /bin/bash -c "pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/; \
# python task_server.py"
