FROM --platform=$BUILDPLATFORM alpine:3.22.2 AS build

ENV VUE_APP_NETEASE_API_URL=/api

WORKDIR /app

COPY . .

RUN apk add --no-cache python3 make g++ git npm \
    && npm install --frozen-lockfile \
    && npm build

# app

FROM node:22-alpine AS app

RUN apk add --no-cache nginx && npm i -g @neteasecloudmusicapienhanced/api

COPY --from=build /app/docker/nginx.conf.example /etc/nginx/http.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80 3000

ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["sh", "-c", "nginx && exec npx @neteasecloudmusicapienhanced/api"]
