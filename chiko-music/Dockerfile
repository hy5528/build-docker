FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN apk add --no-cache python3 make g++ git
RUN npm install && npm run build

FROM nginx:alpine
WORKDIR /app

COPY --from=builder /app/dist /usr/share/nginx/html
RUN git clone git@gitlab.com:ice909/NeteaseCloudMusicApi.git



RUN cd NeteaseCloudMusicApi \
	&& npm config set registry "https://registry.npmmirror.com/" \
	&& npm install -g npm husky \
	&& npm install --production
EXPOSE 80 443 3000
CMD ["npx", "NeteaseCloudMusicApi"]

