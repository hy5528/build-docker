FROM --platform=$BUILDPLATFORM node:16-alpine AS build

ENV VUE_APP_NETEASE_API_URL=/server NeteaseCloudMusicApi

WORKDIR /app

COPY . .

RUN apk add --no-cache python3 make g++ git \
    && yarn install --frozen-lockfile \
    && yarn build

# app

FROM alpine:3.22.2 as app

RUN apk add --no-cache npm python3 nginx \
    && npm install -g @unblockneteasemusic/server NeteaseCloudMusicApi

COPY --from=build /app/docker/nginx.conf.example /etc/nginx/http.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80 3000

CMD ["sh", "-c", "nginx && exec npx @neteasecloudmusicapienhanced/api"]
