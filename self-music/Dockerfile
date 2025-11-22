FROM alpine:3.22.2

# Install GStreamer and other required Debian packages
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
 && apk update \
 && apk add --no-cache \
  dumb-init \
  shadow \
  sudo \
  git \
  alsa-utils \
  py3-pip \
  mopidy \
 && rm -rf /var/cache/apk/*
# Install Node, to build Iris JS application
RUN apk add --no-cache nodejs npm

# Allow pip to install over system packages
ENV PIP_BREAK_SYSTEM_PACKAGES 1


# 设置工作目录
WORKDIR /app
# 安装依赖

COPY requirements.txt .
RUN pip3 install --upgrade --break-system-packages pip \
&& pip3 install --break-system-packages --no-cache-di -r requirements.txt

# 拷贝项目代码
COPY . .

# 暴露端口
EXPOSE 8000

# 运行 uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
