FROM --platform=$BUILDPLATFORM node:22.12.0-alpine as builder


# install dependencies and build tools
RUN apk update && apk add --no-cache wget curl git zip

WORKDIR /app

RUN git clone --recurse-submodules https://github.com/algerkong/AlgerMusicPlayer.git

RUN cd AlgerMusicPlayer \
    echo 'MUSIC_API_URL = /api' > .env.development \
	&& npm install  \
	&& npm run build \
        && zip -r renderer.zip  out/renderer


FROM node:22.12.0-alpine

RUN apk update && apk add --no-cache bash wget curl git nginx unzip

WORKDIR /app

COPY --from=builder /app/AlgerMusicPlayer/renderer.zip ./
RUN unzip renderer.zip && rm -rf renderer.zip

ADD default.conf /etc/nginx/http.d/

RUN cd /app && git clone https://github.com/lu2009/NeteaseCloudMusicAPI.git NeteaseCloudMusicApi

RUN cd NeteaseCloudMusicApi \
	&& npm config set registry "https://registry.npmmirror.com/" \
	&& npm install -g npm husky \
	&& npm install --production

WORKDIR /app/NeteaseCloudMusicApi

ADD docker-entrypoint.sh ./
ADD check.sh ./

RUN chmod +x /app/NeteaseCloudMusicApi/*.sh

EXPOSE 80 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
