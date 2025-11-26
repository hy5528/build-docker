# build
FROM node:18-alpine AS builder

RUN apk add --no-cache git python3 make g++

RUN apk update && apk add --no-cache git

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["npx"]
