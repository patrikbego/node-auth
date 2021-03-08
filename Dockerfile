FROM node:15.8.0

RUN apt-get update
RUN apt-get install -y netcat
RUN apt-get install -y dnsutils

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
RUN pwd

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY bin /usr/src/app/bin
COPY public /usr/src/app/public
COPY src /usr/src/app/src
COPY views /usr/src/app/public
COPY package*.json /usr/src/app/
COPY config.local.js /usr/src/app/
COPY localhost.crt /usr/src/app/
COPY localhost.key /usr/src/app/
COPY app.js /usr/src/app
RUN npm install

EXPOSE 3005

CMD node bin/www
