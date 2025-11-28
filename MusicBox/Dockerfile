FROM node:22-alpine

WORKDIR /app

COPY . .
RUN apk add --no-cache python3 make g++ git
RUN npm install \
    && npm run install:renderer \
    && npm run install:rs
RUN npm run build

FROM alpine:3.22.2
WORKDIR /app
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

# Install additional mopidy extensions and Python dependencies via pip
ADD --chmod=755 ./requirements.txt /requirements.txt
RUN pip install --break-system-packages -r requirements.txt

# 暴露端口
EXPOSE 8080

# 启动应用
CMD ["npm", "start"]


