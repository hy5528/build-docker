FROM --platform=$BUILDPLATFORM node:18-alpine AS builder

# Maintainer
LABEL maintainer="Crazyrico Open Source Software <crazyrico@qq.com>"

# install dependencies and build tools
RUN apk update && apk add --no-cache wget curl git zip

WORKDIR /app

RUN git clone --recurse-submodules https://github.com/algerkong/AlgerMusicPlayer.git

RUN cd AlgerMusicPlayer \
	&& npm install  \
	&& npm run build 

FROM node:22-alpine AS app

RUN apk update && apk add --no-cache bash nginx npm

WORKDIR /app
COPY --from=builder /out/renderer/* ./
ADD default.conf /etc/nginx/http.d/

RUN npm install @neteasecloudmusicapienhanced/api -g

WORKDIR /app/NeteaseCloudMusicApi

ADD docker-entrypoint.sh ./
ADD check.sh ./

RUN chmod +x /app/NeteaseCloudMusicApi/*.sh

EXPOSE 80 3000

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

ENTRYPOINT ["./docker-entrypoint.sh"]

CMD ["npx", "NeteaseCloudMusicApi"]
