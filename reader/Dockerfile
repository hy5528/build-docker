FROM --platform=$BUILDPLATFORM node:18-bookworm-slim AS web-builder
WORKDIR /web
COPY web/package.json web/package-lock.json ./
RUN npm ci || npm install
COPY web/ .
RUN npm run build

# 第二阶段：运行镜像（复制预编译二进制 + web 产物，无编译）
FROM --platform=$TARGETPLATFORM debian:bookworm-slim
ARG TARGETARCH
ENV TZ=Asia/Shanghai
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates tzdata \
    && rm -rf /var/lib/apt/lists/*
COPY --from=web-builder /web/dist /app/src/main/resources/web
COPY bin/linux-${TARGETARCH}/reader /usr/local/bin/reader
WORKDIR /app
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/reader"]
CMD ["--port=8080"]
