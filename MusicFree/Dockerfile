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

# Allow pip to install over system packages
ENV PIP_BREAK_SYSTEM_PACKAGES 1

RUN git clone --depth 1 --single-branch -b ${IRIS_VERSION} https://github.com/maotoumao/MusicFreeDesktop.git /app \
 && cd /app \
 && npm install \
 && npm run serve \
 && npm run build

EXPOSE 80 

ENV NODE_TLS_REJECT_UNAUTHORIZED=0
