FROM alpine:3

ARG VERSION


# Install GStreamer and other required Debian packages
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
 && apk update \
 && apk add --no-cache \
  sudo \
  git \
  py3-pip \
  mopidy \
 && rm -rf /var/cache/apk/*

# Allow pip to install over system packages
ENV PIP_BREAK_SYSTEM_PACKAGES 1

# Install additional mopidy extensions and Python dependencies via pip
ADD --chmod=755 ./requirements.txt /requirements.txt
RUN pip install --break-system-packages -r requirements.txt

# Cleanup
RUN rm -rf /root/.cache \
 && rm -rf /iris/node_modules
 
ENV TZ=Asia/Shanghai

EXPOSE 6600 6680

ENTRYPOINT ["mopidy"]
