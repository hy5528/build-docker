FROM --platform=$BUILDPLATFORM node:16-alpine AS build


RUN apk add --no-cache python3 make g++ git npm

WORKDIR /

RUN git clone https://github.com/maotoumao/MusicFreeDesktop.git 
RUN git clone --depth 1 --single-branch  https://github.com/maotoumao/MusicFreeDesktop.git \
 && cd /MusicFreeDesktop \
 && npm install \
 && npm run prod

EXPOSE 80 

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

CMD ["npx"]
