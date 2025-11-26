# build
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder

RUN apk add --no-cache git python3 make g++ npm
RUN git clone https://github.com/algerkong/AlgerMusicPlayer.git app

WORKDIR /app

ADD --chmod=755 ./package.json /package.json
RUN npm install

COPY . .

RUN npm run build


ENV NODE_TLS_REJECT_UNAUTHORIZED=0
VOLUME ["/data"]

CMD ["npx"]
