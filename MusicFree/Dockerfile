FROM --platform=$BUILDPLATFORM node:16-alpine AS build

WORKDIR /app

RUN apk add --no-cache python3 make g++ git npm



RUN git clone --recurse-submodules https://github.com/maotoumao/MusicFreeDesktop.git 
RUN cd /MusicFreeDesktop \
 && npm install  \
 && npm run build

EXPOSE 80 

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

CMD ["npx"]
