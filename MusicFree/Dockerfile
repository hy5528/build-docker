FROM alpine:3.22.2

# Install GStreamer and other required Debian packages
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
 && apk update \
 && apk add --no-cache \
  dumb-init \
  shadow \
  npm \
  sudo \
  git \
  alsa-utils \
  py3-pip \
 && rm -rf /var/cache/apk/*

# Allow pip to install over system packages
ENV PIP_BREAK_SYSTEM_PACKAGES 1

WORKDIR /app

RUN git clone --recurse-submodules https://github.com/maotoumao/MusicFreeDesktop.git 
 && cd /MusicFreeDesktop \
 && npm install  \
 && npm run build

EXPOSE 80 

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

CMD ["npx"]
