FROM node:15.8.0

RUN apt-get update
RUN apt-get install -y netcat
RUN apt-get install -y dnsutils

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY package.json /usr/src/app/
RUN npm install

EXPOSE 3005

COPY . /usr/src/app

#CMD node index.js
