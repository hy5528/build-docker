FROM --platform=$BUILDPLATFORM node:18-alpine as mmPlayer_builder

# Maintainer
LABEL maintainer="Crazyrico Open Source Software <crazyrico@qq.com>"

# install dependencies and build tools
RUN apk update && apk add --no-cache wget curl git zip

WORKDIR /app

RUN git clone --recurse-submodules https://github.com/chen-ziwen/chiko-music.git Vue-mmPlayer

RUN cd Vue-mmPlayer \
	&& echo 'VUE_APP_BASE_API_URL = /api' > .env \
	&& npm install  \
	&& npm run build \
        && zip -r dist.zip dist


FROM node:18-alpine

RUN apk update && apk add --no-cache bash wget curl git nginx unzip

WORKDIR /app

COPY --from=mmPlayer_builder /app/Vue-mmPlayer/dist.zip ./
RUN unzip dist.zip && rm -rf dist.zip

ADD default.conf /etc/nginx/http.d/

RUN cd /app && git clone https://github.com/ice909/NeteaseCloudMusicApi.git NeteaseCloudMusicApi

RUN cd NeteaseCloudMusicApi \
	&& npm config set registry "https://registry.npmmirror.com/" \
	&& npm install -g npm husky \
	&& npm install --production \
	&& node app.js
RUN npm install @unblockneteasemusic/server \
    && yarn add @unblockneteasemusic/server # for Yarn users
WORKDIR /app/NeteaseCloudMusicApi

ADD docker-entrypoint.sh ./
ADD check.sh ./

RUN chmod +x /app/NeteaseCloudMusicApi/*.sh

EXPOSE 80 443 3000

ENTRYPOINT ["./docker-entrypoint.sh"]

CMD ["npx", "NeteaseCloudMusicApi","unblockneteasemusic"]
