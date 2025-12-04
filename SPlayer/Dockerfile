# build
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder

RUN apk update && apk add --no-cache git

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# add .env.example to .env
RUN [ ! -e ".env" ] && cp .env.example .env || true

RUN npm run build

# nginx
FROM nginx:1.27-alpine-slim AS app

COPY --from=builder /app/out/renderer /usr/share/nginx/html

COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

ADD --chmod=755 ./docker-entrypoint.sh /docker-entrypoint.sh

RUN apk add --no-cache npm python3 youtube-dl \
    && npm install -g @unblockneteasemusic/server \
    && wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp \
    && chmod +x /usr/local/bin/yt-dlp \
    && chmod +x /docker-entrypoint.sh

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["npx", "NeteaseCloudMusicApi"]
