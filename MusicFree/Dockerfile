FROM --platform=$BUILDPLATFORM node:20-alpine as builder

# Maintainer
LABEL maintainer="Crazyrico Open Source Software <crazyrico@qq.com>"

# install dependencies and build tools
RUN apk update && apk add --no-cache wget curl git zip

WORKDIR /app

RUN git clone https://github.com/maotoumao/MusicFree.git

RUN cd MusicFree \
	&& npm install 


EXPOSE 80 

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

CMD ["npm", "start"]
