FROM alpine:3.22.2

# Install GStreamer and other required Debian packages
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
 && apk update \
 && apk add --no-cache \
  dumb-init \
  shadow \
  sudo \
  git \
  g++ \
  make \
  py3-pip \
  mopidy \
 && rm -rf /var/cache/apk/*

# Allow pip to install over system packages
ENV PIP_BREAK_SYSTEM_PACKAGES 1


ENV VUE_APP_NETEASE_API_URL=/api

WORKDIR /app

COPY . .

RUN yarn install \
    && yarn build


EXPOSE 80 

CMD ["sh", "-c"]
