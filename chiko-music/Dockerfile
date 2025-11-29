FROM --platform=$BUILDPLATFORM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN apk add --no-cache python3 make g++ git
RUN npm install && npm run build

FROM nginx:alpine

WORKDIR /app

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80 443 3000
CMD ["npx", "NeteaseCloudMusicApi"]

