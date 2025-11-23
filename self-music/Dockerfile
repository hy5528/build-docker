FROM --platform=$BUILDPLATFORM node:16-alpine AS build

ENV VUE_APP_NETEASE_API_URL=/api

WORKDIR /app

COPY . .

RUN apk add --no-cache python3 make g++ git \
    && yarn install --frozen-lockfile \
    && yarn build

FROM alpine:3.22.2
WORKDIR /


RUN apk add --no-cache nginx && npm i -g @neteasecloudmusicapienhanced/api


# Install additional mopidy extensions and Python dependencies via pip
ADD --chmod=755 ./requirements.txt /requirements.txt
RUN pip install --break-system-packages -r requirements.txt 

# Create a staging area for default data to initialize volumes
RUN mkdir /defaults
ADD --chmod=755 ./config.yaml /defaults/config.yaml
ADD --chmod=755 ./music.db /defaults/music.db

# Copy configs
ADD --chmod=755 ./supervisord.conf /etc/supervisor/conf.d/supervisord.conf
ADD --chmod=755 ./nginx.standalone.conf /etc/nginx/sites-available/default

EXPOSE 80 3000

CMD ["sh", "-c", "nginx && exec npx @neteasecloudmusicapienhanced/api"]
