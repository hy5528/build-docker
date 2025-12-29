FROM alpine:3

ARG VERSION


# Install GStreamer and other required Debian packages
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
 && apk update \
 && apk add --no-cache \
  sudo \
  curl \
  py3-pip \
 && rm -rf /var/cache/apk/*

# Allow pip to install over system packages
ENV PIP_BREAK_SYSTEM_PACKAGES 1

# Install additional mopidy extensions and Python dependencies via pip
ADD --chmod=755 ./requirements.txt /requirements.txt
RUN pip install --break-system-packages -r requirements.txt

# Cleanup
RUN rm -rf /root/.cache \
 && rm -rf /iris/node_modules


# 複製專案所有檔案到工作目錄
COPY . .

# 宣告資料 Volume
VOLUME /app/data

# 宣告容器對外的連接埠
EXPOSE 5000

CMD ["gunicorn", \
     "--worker-class", "sync", \
     "--workers", "2", \
     "--timeout", "120", \
     "--graceful-timeout", "25", \
     "--max-requests", "800", \
     "--max-requests-jitter", "80", \
     "--keep-alive", "4", \
     "--preload", \
     "--bind", "0.0.0.0:5000", \
     "--access-logfile", "-", \
     "--error-logfile", "-", \
     "web_app:app"]
