FROM --platform=$BUILDPLATFORM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN apk add --no-cache python3 make g++ git
RUN npm install && npm run build

FROM nginx:alpine
RUN apk update && apk add --no-cache bash wget curl git
WORKDIR /app

COPY --from=builder /app/dist /usr/share/nginx/html
RUN apk add --no-cache npm python3 youtube-dl \
    && npm install -g @unblockneteasemusic/server NeteaseCloudMusicApi 
EXPOSE 80 443 3000
CMD ["npx", "NeteaseCloudMusicApi"]

