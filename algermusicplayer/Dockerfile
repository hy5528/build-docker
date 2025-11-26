FROM alpine:3.22.2

RUN apk add --no-cache git python3 make g++ curl supervisor && \
    rm -rf /var/cache/apk/*

WORKDIR /app
RUN npm config set registry https://registry.npmmirror.com

COPY supervisord.conf entrypoint.sh ./
RUN chmod +x entrypoint.sh

ENV NODE_ENV=development

EXPOSE 5173 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5173 || exit 1

VOLUME ["/data", "/app/frontend"]

CMD ["./entrypoint.sh"]
