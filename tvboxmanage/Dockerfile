FROM --platform=$BUILDPLATFORM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts --registry https://registry.npmmirror.com && \
    npm rebuild esbuild better-sqlite3
COPY . .

RUN npm run build:node

FROM node:20-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts --registry https://registry.npmmirror.com && \
    npm rebuild better-sqlite3 && \
    apk del python3 make g++
COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/data
VOLUME /app/data

ENV PORT=5678
ENV DATA_DIR=/app/data
EXPOSE 5678

CMD ["node", "dist/server.js"]
