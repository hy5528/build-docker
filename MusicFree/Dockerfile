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

# nginx
FROM nginx:1.27-alpine-slim AS app

COPY --from=builder /app/out/renderer /usr/share/nginx/html

COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

ADD docker-entrypoint.sh ./
ADD check.sh ./

RUN apk add --no-cache npm python3 youtube-dl \
    && npm install -g @unblockneteasemusic/server NeteaseCloudMusicApi \
    && wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp \
    && chmod +x /usr/local/bin/yt-dlp \
    && chmod +x /docker-entrypoint.sh

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["npx", "NeteaseCloudMusicApi"]
