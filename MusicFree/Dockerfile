FROM node:18-alpine AS frontend-builder
RUN apk add --no-cache git python3 make g++ curl npm supervisor && \
    rm -rf /var/cache/apk/*

WORKDIR /app
RUN npm install

COPY . .

RUN npm run build

CMD ["npx"]
