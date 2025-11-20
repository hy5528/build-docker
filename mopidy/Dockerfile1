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

ADD --chmod=755 ./requirements.txt /requirements.txt

# RUN pip3 install -r requirements.txt \
RUN pip install --break-system-packages -r requirements.txt

# Cleanup
RUN rm -rf /root/.cache \
 && rm -rf /iris/node_modules

 
ENV TZ=Asia/Shanghai

EXPOSE 6600 6680

ENTRYPOINT ["mopidy"]
