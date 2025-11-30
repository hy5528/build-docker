FROM --platform=$BUILDPLATFORM node:22-alpine AS builder


# install dependencies and build tools
RUN apk update && apk add --no-cache wget curl git zip

WORKDIR /app

RUN git clone --recurse-submodules https://github.com/chen-ziwen/chiko-music.git

RUN cd chiko-music 
RUN npm config set registry https://registry.npmmirror.com/ && \
    npm install
RUN npm run build

FROM nginx:1.29.3-alpine3.22-slim AS app

RUN apk update && apk add --no-cache bash wget curl git nginx unzip npm

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

ADD docker-entrypoint.sh ./
ADD check.sh ./

RUN chmod +x /app/NeteaseCloudMusicApi/*.sh

EXPOSE 80 443 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
