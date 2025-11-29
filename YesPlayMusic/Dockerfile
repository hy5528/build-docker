FROM --platform=$BUILDPLATFORM node:16-alpine AS build

ENV VUE_APP_NETEASE_API_URL=/api

WORKDIR /app

COPY . .

RUN apk add --no-cache python3 make g++ git \
    && yarn install --frozen-lockfile \
    && yarn build

# app

FROM node:22-alpine AS app

RUN apk add --no-cache nginx && npm i -g @unblockneteasemusic/server neteasecloudmusicapienhanced/api

COPY --from=build /app/docker/nginx.conf.example /etc/nginx/http.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
ADD --chmod=755 ./docker-entrypoint.sh /docker-entrypoint.sh

EXPOSE 80 3000

CMD ["sh", "-c", "nginx && exec npx @neteasecloudmusicapienhanced/api"]
