FROM node:latest

WORKDIR /home/app
USER node
ENV PORT 1995

EXPOSE 1995

ENTRYPOINT /bin/bash
