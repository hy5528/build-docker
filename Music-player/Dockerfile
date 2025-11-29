FROM alpine:3.22.2

# Install GStreamer and other required Debian packages
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
 && apk update \
 && apk add --no-cache \
  dumb-init \
  shadow \
  sudo \
  git \
  curl \
  wget \
 && rm -rf /var/cache/apk/*

# Allow pip to install over system packages
ENV PIP_BREAK_SYSTEM_PACKAGES 1

RUN git clone git@github.com:chen-ziwen/NeteaseCloudMusicApi.git \
&& cd NeteaseCloudMusicApi \
&& npm install \
&& node app.js
RUN git clone git@github.com:chen-ziwen/chiko-music.git \
&& cd chiko-music \
&& npm install \
&& npm start \
&& npm run build
 
ENV TZ=Asia/Shanghai

EXPOSE 6600 6680


EXPOSE 80 443 3000
CMD ["npx", "NeteaseCloudMusicApi"]

