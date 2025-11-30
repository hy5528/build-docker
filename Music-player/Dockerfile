FROM --platform=$BUILDPLATFORM node:20-alpine AS builder



# install dependencies and build tools
RUN apk update && apk add --no-cache wget curl git zip

WORKDIR /app

RUN git clone --recurse-submodules https://github.com:chen-ziwen/chiko-music.git 

RUN cd chiko-music \
	&& echo 'VITE_API_BASE_URL = /api' > .env \
	&& npm install  \
	&& npm run build \
        && zip -r dist.zip dist


FROM node:20-alpine

RUN apk update && apk add --no-cache bash wget curl git nginx unzip

WORKDIR /app

COPY --from=builder /app/chiko-music/dist.zip ./
RUN unzip dist.zip && rm -rf dist.zip

ADD default.conf /etc/nginx/http.d/

RUN cd /app && git clone https://github.com/lu2009/NeteaseCloudMusicAPI.git NeteaseCloudMusicApi

RUN cd NeteaseCloudMusicApi \
	&& npm config set registry "https://registry.npmmirror.com/" \
	&& npm install -g npm husky \
	&& npm install --production

WORKDIR /app/NeteaseCloudMusicApi


ADD check.sh ./

RUN chmod +x /app/NeteaseCloudMusicApi/*.sh

ENV TZ=Asia/Shanghai



EXPOSE 80 443 3000
CMD ["npx", "NeteaseCloudMusicApi"]

