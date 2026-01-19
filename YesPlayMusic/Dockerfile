FROM --platform=$BUILDPLATFORM node:16-alpine AS build

ENV VUE_APP_NETEASE_API_URL=https://api.hypcvgm.top/NeteaseMiniPlayer/nmp.php

WORKDIR /app

COPY . .

RUN apk add --no-cache python3 make g++ git \
    && yarn install --frozen-lockfile \
    && yarn build

# app

FROM nginx:1.29.3-alpine3.22-slim AS app


COPY --from=build /app/docker/nginx.conf.example /etc/nginx/http.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80 3000

CMD ["sh", "-c", "nginx && exec npx @neteaseapireborn/api@latest"]
