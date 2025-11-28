FROM alpine:3.22.2

WORKDIR /app
# Install GStreamer and other required Debian packages
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
 && apk update \
 && apk add --no-cache \
  dumb-init \
  nodejs \
  git \
  npm \
  py3-pip \
 && rm -rf /var/cache/apk/*
 # Allow pip to install over system packages
ENV PIP_BREAK_SYSTEM_PACKAGES 1

WORKDIR /
RUN wget -O app.tar.gz https://github.com/asxez/MusicBox/releases/download/0.2.4/musicbox-0.2.4.tar.gz

# 合并并解压app.part_*文件到/app目录
RUN mkdir -p /app && \
    tar -xzf app.tar.gz -C /app && \
    rm app.tar.gz


WORKDIR /app
# 构建当前平台版本
RUN npm run build

# 暴露端口
EXPOSE 8080

# 启动应用
CMD ["npm", "start"]


