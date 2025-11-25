
FROM --platform=$BUILDPLATFORM node:18-alpine as mmPlayer_builder

# Maintainer
LABEL maintainer="Crazyrico Open Source Software <crazyrico@qq.com>"

# install dependencies and build tools
RUN apk update && apk add --no-cache wget curl git 

WORKDIR /app

RUN git clone --depth 1  https://github.com/maotoumao/MusicFreeDesktop.git /app \
 && cd /app \
 && npm install \
 && npm run serve \
 && npm run build

EXPOSE 80 

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

CMD ["npx"]
