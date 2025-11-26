FROM node:18-alpine AS builder
RUN apk add --no-cache git python3 make g++ curl npm supervisor && \
    rm -rf /var/cache/apk/*
WORKDIR /app
RUN git clone https://github.com/algerkong/AlgerMusicPlayer.git frontend
WORKDIR /app/frontend
RUN npm install
COPY . .
RUN npm run build

CMD ["npx"]
