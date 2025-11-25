# build
FROM node:20-alpine AS builder

RUN apk update && apk add --no-cache git

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .


RUN npm run build
       

ADD ./docker-entrypoint.sh /
ADD ./check.sh /
ADD ./.env /

EXPOSE 80 443 3000

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

ENTRYPOINT ["./docker-entrypoint.sh"]

CMD ["npx"]
