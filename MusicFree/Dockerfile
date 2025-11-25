FROM alpine:3.22.2 as builder
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
  py3-pip \
  unzip

# Install Node, to build Iris JS application
RUN apk add nodejs npm

# Allow pip to install over system packages
ENV PIP_BREAK_SYSTEM_PACKAGES 1

RUN git clone --recurse-submodules https://github.com/algerkong/AlgerMusicPlayer.git

RUN cd AlgerMusicPlayer \
	&& npm install  \
	&& npm run build \
        && zip -r dist.zip dist

WORKDIR /app

COPY --from=builder /app/AlgerMusicPlayer/dist.zip ./
RUN unzip dist.zip && rm -rf dist.zip

ADD default.conf /etc/nginx/http.d/

RUN cd /app && git clone https://github.com/lu2009/NeteaseCloudMusicAPI.git NeteaseCloudMusicApi

RUN cd NeteaseCloudMusicApi \
	&& npm config set registry "https://registry.npmmirror.com/" \
	&& npm install -g npm husky \
	&& npm install --production

WORKDIR /app/NeteaseCloudMusicApi

ADD docker-entrypoint.sh ./
ADD check.sh ./

RUN chmod +x /app/NeteaseCloudMusicApi/*.sh

EXPOSE 80 3000

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

ENTRYPOINT ["./docker-entrypoint.sh"]

CMD ["npx", "NeteaseCloudMusicApi"]

