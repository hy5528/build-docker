FROM --platform=$BUILDPLATFORM node:21-alpine AS build

ENV VUE_APP_NETEASE_API_URL=/api

WORKDIR /app

COPY . .

RUN apk add --no-cache python3.9 make g++ git \
    && yarn install --frozen-lockfile \
    && yarn build

# app

FROM node:22-alpine AS app

RUN apk add --no-cache nginx && npm i -g @neteasecloudmusicapienhanced/api

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80 3000

CMD ["sh", "-c", "nginx && exec npx @neteasecloudmusicapienhanced/api"]
