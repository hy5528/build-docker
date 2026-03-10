FROM --platform=$BUILDPLATFORM node:18-alpine as builder

RUN apk add --no-cache git python3 make g++
COPY package.json ./

# skip postinstall
RUN npm install 

COPY . .

WORKDIR /app
RUN npm run build


FROM nginx:alpine

RUN apk add --no-cache nodejs npm supervisor curl && \
    rm -rf /var/cache/apk/*

COPY --from=builder /app/out/renderer /usr/share/nginx/html


ADD --chmod=755 ./nginx.conf /etc/nginx/nginx.conf
ADD --chmod=755 ./supervisord.prod.conf /etc/supervisor/conf.d/supervisord.conf
ADD --chmod=755 ./entrypoint.sh /entrypoint.sh

RUN mkdir -p /var/log/supervisor /data && \
    chmod +x /entrypoint.sh

ENV NODE_ENV=production

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost || exit 1

VOLUME ["/data"]

CMD ["/entrypoint.sh"]
