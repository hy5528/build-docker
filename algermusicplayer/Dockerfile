FROM node:20-alpine as builder

RUN apk add --no-cache git python3 make g++ npm

WORKDIR /app

RUN git clone https://github.com/algerkong/AlgerMusicPlayer.git frontend
WORKDIR /app/frontend
RUN npm install && npm run build

WORKDIR /app
RUN git clone https://github.com/nooblong/NeteaseCloudMusicApiBackup.git api
WORKDIR /app/api
RUN npm install

FROM nginx:alpine

RUN apk add --no-cache nodejs npm supervisor curl && \
    rm -rf /var/cache/apk/*
    
COPY --from=builder /app/frontend/out/renderer /usr/share/nginx/html
COPY --from=builder /app/api /app/api

COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.prod.conf /etc/supervisor/conf.d/supervisord.conf
COPY entrypoint.prod.sh /entrypoint.sh

RUN mkdir -p /var/log/supervisor /data && \
    chmod +x /entrypoint.sh

ENV NODE_ENV=production

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost || exit 1

VOLUME ["/data"]

CMD ["/entrypoint.sh"]




