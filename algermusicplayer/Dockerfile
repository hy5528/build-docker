FROM alpine:3.22.2 AS base
WORKDIR /
# Install GStreamer and other required Debian packages
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
 && apk update \
 && apk add --no-cache \
  dumb-init \
  shadow \
  nodejs \
  git \
  npm \
  py3-pip \
 && rm -rf /var/cache/apk/*
 # Allow pip to install over system packages
ENV PIP_BREAK_SYSTEM_PACKAGES 1

FROM node:18-alpine AS frontend-builder
WORKDIR /app
RUN npm install -g pnpm
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install
COPY frontend/ .
RUN pnpm build


WORKDIR /app
RUN git clone https://github.com/nooblong/NeteaseCloudMusicApiBackup.git api
WORKDIR /app/api
RUN npm config set registry "https://registry.npmmirror.com/" \
	&& npm install -g npm husky \
	&& npm install --production

FROM nginx:1.27-alpine-slim AS app
WORKDIR /app
RUN apk add --no-cache nodejs npm supervisor curl && \
    rm -rf /var/cache/apk/*

COPY --from=builder /app/out/renderer /usr/share/nginx/html
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




















