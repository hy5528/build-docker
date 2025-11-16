FROM --platform=$BUILDPLATFORM node:16-alpine AS build

ENV VUE_APP_NETEASE_API_URL=/api

WORKDIR /app

COPY . .

RUN apk add --no-cache python3 make g++ git \
    && yarn install --frozen-lockfile \
    && yarn build

# app

FROM node:22-alpine AS app

RUN apk add --no-cache nginx && npm i -g @neteasecloudmusicapienhanced/api

COPY --from=build /app/docker/nginx.conf.example /etc/nginx/http.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/docker-entrypoint.sh /docker-entrypoint.sh
RUN wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp \
    && chmod +x /usr/local/bin/yt-dlp \
    && chmod +x /docker-entrypoint.sh
EXPOSE 80 3000
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["npx","sh", "-c", "nginx && exec npx @neteasecloudmusicapienhanced/api"]
