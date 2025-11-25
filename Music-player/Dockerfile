# build
FROM node:20-alpine AS builder

RUN apk update && apk add --no-cache git

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .


RUN npm run build
       
FROM node:18-alpine

RUN apk update && apk add --no-cache bash  nginx npm

WORKDIR /app

ADD default.conf /etc/nginx/http.d/

RUN npm install @neteasecloudmusicapienhanced/api -g

WORKDIR /app/NeteaseCloudMusicApi

ADD docker-entrypoint.sh ./
ADD check.sh ./

RUN chmod +x /app/NeteaseCloudMusicApi/*.sh

EXPOSE 80 443 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
