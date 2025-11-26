FROM node:18-alpine AS frontend-builder
RUN apk add --no-cache git python3 make g++ curl npm supervisor && \
    rm -rf /var/cache/apk/*

WORKDIR /
RUN git clone https://github.com/algerkong/AlgerMusicPlayer.git app
WORKDIR /app
RUN npm install
COPY . .
RUN npm run build

CMD ["npx"]
