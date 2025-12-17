FROM alpine:3.22.2

# Install GStreamer and other required Debian packages
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
 && apk update \
 && apk add --no-cache \
  dumb-init \
  npm \
  sudo \
  git \
  py3-pip \
 && rm -rf /var/cache/apk/*
# Allow pip to install over system packages
ENV PIP_BREAK_SYSTEM_PACKAGES 1

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖（使用淘宝镜像加速）
RUN npm install
    

# 复制源代码并构建
COPY . .
RUN npm run build

EXPOSE 80

CMD ["--stdout", "--no-daemon"]
