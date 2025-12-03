# build
FROM node:18-alpine as builder

RUN apk update && apk add --no-cache git

WORKDIR /app

COPY package*.json ./

RUN npm install pnpm -g

RUN pnpm install

COPY . .

RUN [ ! -e ".env" ] && cp .env.example .env || true

RUN pnpm run build

# nginx
FROM nginx:1.25.3-alpine-slim as app

COPY --from=builder /app/out/renderer /usr/share/nginx/html

COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

RUN apk add --no-cache npm

RUN apk add --no-cache npm python3 youtube-dl \
    && npm install -g @unblockneteasemusic/server NeteaseCloudMusicApi \
    && wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp \
    && chmod +x /usr/local/bin/yt-dlp

CMD ["npx", "NeteaseCloudMusicApi"]
