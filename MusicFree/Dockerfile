FROM alpine:3.22.2

# Switch to the root user while we do our changes
USER root
WORKDIR /

# Install GStreamer and other required Debian packages
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
 && apk update \
 && apk add \
  dumb-init \
  shadow \
  sudo \
  git \
  alsa-utils \
  py3-pip 

# Install Node, to build Iris JS application
RUN apk add nodejs npm

# Allow pip to install over system packages
ENV PIP_BREAK_SYSTEM_PACKAGES 1

RUN git clone --depth 1 --single-branch  https://github.com/maotoumao/MusicFreeDesktop.git \
 && cd /MusicFreeDesktop \
 && npm install \


EXPOSE 80 

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

CMD ["npx"]
