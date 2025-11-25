# build
FROM --platform=$BUILDPLATFORM node:18-alpine AS builder

RUN apk update && apk add --no-cache git

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
RUN npm run build
ADD --chmod=755 ./.env.development.local /src/renderer


EXPOSE 80
CMD ["npx"]
