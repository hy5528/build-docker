FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN apk add --no-cache python3 make g++ git
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
RUN apk add --no-cache npm python3 \
    && npm install -g @unblockneteasemusic/server NeteaseCloudMusicApi
CMD ["npm", "NeteaseCloudMusicApi"]

