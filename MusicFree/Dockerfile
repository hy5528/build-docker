# build
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder

RUN apk update && apk add --no-cache git

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
RUN npm run build

EXPOSE 80
CMD ["npx"]
