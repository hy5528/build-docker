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

WORKDIR /app


USER node
EXPOSE 3000

CMD ["node", "app.js" ]
