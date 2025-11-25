FROM --platform=$BUILDPLATFORM node:18-alpine AS builder

# Maintainer
LABEL maintainer="Crazyrico Open Source Software <crazyrico@qq.com>"

# install dependencies and build tools
RUN apk update && apk add --no-cache wget curl git zip

WORKDIR /app

RUN git clone --recurse-submodules https://github.com/algerkong/AlgerMusicPlayer.git

RUN cd AlgerMusicPlayer \
	&& npm install  \
	&& npm run build 

EXPOSE 80
CMD ["npx"]
