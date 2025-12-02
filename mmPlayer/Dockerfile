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
FROM node:18-alpine

RUN apk update && apk add --no-cache bash wget curl git 

WORKDIR /app

COPY . .

RUN cd /app && git clone https://github.com/lu2009/NeteaseCloudMusicAPI.git NeteaseCloudMusicApi

RUN cd NeteaseCloudMusicApi \
	&& npm config set registry "https://registry.npmmirror.com/" \
	&& npm install -g npm husky \
	&& npm install --production
WORKDIR /app/NeteaseCloudMusicApi
RUN chmod +x /app/NeteaseCloudMusicApi/*.sh

WORKDIR /app

COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/api /app/api

COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.prod.conf /etc/supervisor/conf.d/supervisord.conf
COPY entrypoint.prod.sh /entrypoint.sh

RUN mkdir -p /var/log/supervisor /data && \
    chmod +x /entrypoint.sh

ENV NODE_ENV=production

EXPOSE 80 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost || exit 1



CMD ["/entrypoint.sh"]

















