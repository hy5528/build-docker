# build
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder

RUN apk add --no-cache git python3 make g++ npm
RUN git clone https://github.com/algerkong/AlgerMusicPlayer.git app

WORKDIR /app

ADD --chmod=755 ./package.json /package.json
RUN npm install

COPY . .

RUN npm run build

# nginx
FROM nginx:1.27-alpine-slim AS app

COPY --from=builder /app/out/renderer /usr/share/nginx/html

RUN apk add --no-cache npm python3 youtube-dl \
    && npm install -g @unblockneteasemusic/server NeteaseCloudMusicApi 
    

ENV NODE_TLS_REJECT_UNAUTHORIZED=0
VOLUME ["/data"]

CMD ["npx", "NeteaseCloudMusicApi"]
