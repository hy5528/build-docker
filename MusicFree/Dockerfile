FROM node:18-alpine AS frontend-builder
RUN apk add --no-cache git python3 make g++ curl supervisor && \
    rm -rf /var/cache/apk/*

WORKDIR /app
RUN npm install -g pnpm
COPY package*.json ./
RUN pnpm install
RUN pnpm build

CMD ["npx"]
