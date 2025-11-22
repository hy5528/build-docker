FROM  debian:12-slim AS base

# Install GStreamer and other required Debian packages
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
 && apk update \
 && apk add --no-cache \
  dumb-init \
  shadow \
  sudo \
  py-pip \
  alpine-sdk \
  python3-dev\
  py3-pip \
 && rm -rf /var/cache/apk/*
# Stage 2: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
RUN npm install -g pnpm
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install
COPY frontend/ .
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN pnpm build

# 设置工作目录

# 安装依赖
FROM alpine:3.22.2
WORKDIR /app
COPY requirements.txt .
RUN pip3 install --upgrade --break-system-packages pip \
&& pip3 install --break-system-packages --no-cache-di -r requirements.txt

# 拷贝项目代码
COPY . .

# 暴露端口
EXPOSE 8000

# 运行 uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
