FROM  --platform=$BUILDPLATFORM node:18-alpine as builder

RUN apk add --no-cache git python3 make g++

WORKDIR /

RUN git clone https://github.com/Dos7t3r/Vue-mmPlayer.git app
WORKDIR /app

COPY package*.json ./

RUN echo 'VUE_APP_BASE_API_URL = /api' > .env \
    && npm install \
    && npm run build

COPY . .


WORKDIR /app
RUN git clone https://github.com/nooblong/NeteaseCloudMusicApiBackup.git api
RUN cd api
RUN npm install 
WORKDIR /app/api
RUN chmod +x /app/api/*.sh

WORKDIR /app
FROM nginx:alpine

RUN apk add --no-cache nodejs npm supervisor curl && \
    rm -rf /var/cache/apk/*

COPY --from=builder /app/dist /usr/share/nginx/html
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



CMD ["/entrypoint.sh"]












