FROM alpine:3.22.2

# Install GStreamer and other required Debian packages
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
 && apk update \
 && apk add --no-cache \
  dumb-init \
  npm \
  sudo \
  git \
  curl \
  wget \
 && rm -rf /var/cache/apk/*

# Allow pip to install over system packages
ENV PIP_BREAK_SYSTEM_PACKAGES 1

RUN npm install -g @unblockneteasemusic/server NeteaseCloudMusicApi

WORKDIR /app

RUN git clone --recurse-submodules github.com:chen-ziwen/chiko-music.git

RUN cd chiko-music \
	
	&& npm install  \
	&& npm run build 

 
ENV TZ=Asia/Shanghai



EXPOSE 80 443 3000
CMD ["npx", "NeteaseCloudMusicApi"]

