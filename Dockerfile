FROM python:3.7

LABEL maintainer="Fossen"

EXPOSE 8000
VOLUME [ "/home/fossen/Fossensite" ]
WORKDIR /home/fossen/Fossensite/fossensite
CMD [ "/bin/bash", "run.sh" ]

# cd /home/fossen/Fossensite/fossensite
# sudo docker build -t fossensite .
# sudo docker run -d --network host --restart=always --name fossensite -v /home/fossen/Fossensite:/home/fossen/Fossensite fossensite
# sudo docker restart fossensite
