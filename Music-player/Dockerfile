FROM --platform=$BUILDPLATFORM node:18-alpine as mmPlayer_builder

# Maintainer
LABEL maintainer="Crazyrico Open Source Software <crazyrico@qq.com>"

# install dependencies and build tools
RUN apk update && apk add --no-cache wget curl git zip

WORKDIR /app

RUN git clone --recurse-submodules https://github.com/Dos7t3r/Vue-mmPlayer.git

RUN cd Vue-mmPlayer \
	&& echo 'VUE_APP_BASE_API_URL = /api' > .env \
	&& npm install  \
	&& npm run build \
        && zip -r dist.zip dist


FROM node:22-alpine 

RUN apk update && apk add --no-cache bash wget curl git nginx unzip

WORKDIR /app

COPY --from=mmPlayer_builder /app/Vue-mmPlayer/dist.zip ./
RUN unzip dist.zip && rm -rf dist.zip


RUN apk add --no-cache nginx && npm i -g @neteasecloudmusicapienhanced/api
COPY ./dist /usr/share/nginx/html


EXPOSE 80 3000


CMD ["sh", "-c", "nginx && exec npx @neteasecloudmusicapienhanced/api"]
