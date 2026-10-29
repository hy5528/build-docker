
# syntax=docker/dockerfile:1

# -----------------------------------------------------------------------------
# Stage 1: Build HLS native module
# -----------------------------------------------------------------------------
FROM --platform=$BUILDPLATFORM node:22-alpine AS hls-build

# 【关键】替换为国内镜像源，解决 QEMU 环境下 apk update 超时问题
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories \
    && apk update \
    && apk add --no-cache \
        build-base \
        python3 \
        pkgconfig \
        patch \
        ca-certificates \
    && rm -rf /var/cache/apk/*

WORKDIR /build
COPY native/hls ./native/hls
COPY scripts/build-hls.mjs ./scripts/build-hls.mjs

# 执行 HLS 原生模块编译
RUN node scripts/build-hls.mjs

# -----------------------------------------------------------------------------
# Stage 2: Build ECH (Encrypted Client Hello) binary using Go
# -----------------------------------------------------------------------------
FROM --platform=$BUILDPLATFORM golang:1.26-alpine AS ech-build

# 替换源并安装 CA 证书
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories \
    && apk add --no-cache ca-certificates

WORKDIR /build
COPY native/ech/ ./

# 完全静态编译，不依赖任何系统动态库，适配多架构
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/kazumi-ech .

# -----------------------------------------------------------------------------
# Stage 3: Install Node.js full dependencies (Dev + Prod)
# -----------------------------------------------------------------------------
FROM --platform=$BUILDPLATFORM node:22-alpine AS dependencies

# 配置 npm 国内镜像源
RUN npm config set registry https://registry.npmmirror.com

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# -----------------------------------------------------------------------------
# Stage 4: Build Frontend with Vite
# -----------------------------------------------------------------------------
FROM dependencies AS build

COPY index.html vite.config.js ./
COPY src ./src
COPY shared ./shared

# 执行前端生产构建
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 5: Install Production-only Node.js dependencies
# -----------------------------------------------------------------------------
FROM --platform=$BUILDPLATFORM node:22-alpine AS production-dependencies

RUN npm config set registry https://registry.npmmirror.com

WORKDIR /app
COPY package.json package-lock.json ./
# 仅安装生产依赖，清理缓存
RUN npm ci --omit=dev && npm cache clean --force

# -----------------------------------------------------------------------------
# Stage 6: Final Minimal Runtime Image
# -----------------------------------------------------------------------------
FROM node:22-alpine AS runtime

# 【关键】设置 Playwright 国内镜像源和超长超时时间，解决 QEMU 下载失败
ENV PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright
ENV PLAYWRIGHT_INSTALL_TIMEOUT=600000
ENV PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT=600000

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    DATA_DIR=/app/data \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    NODE_EXTRA_CA_CERTS=/app/server/certificates/sslcom-tls-issuing-rsa-r1.crt

WORKDIR /app

# 1. 复制生产环境 Node 依赖
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules

# 2. 安装 Playwright Chromium 运行依赖 + 证书工具
# 【关键修正】 libnss3-tools -> nss-tools (Alpine 包名)
# 替换 Alpine 源，确保安装速度
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories \
    && apk update \
    && apk add --no-cache \
        build-base \
        python3 \
        pkgconfig \
        patch \
        ca-certificates \
    && rm -rf /var/cache/apk/*

# 3. 复制前端构建产物
COPY --from=build --chown=node:node /app/dist ./dist

# 4. 复制核心业务文件
COPY --chown=node:node package.json LICENSE ./
COPY --chown=node:node server ./server
COPY --chown=node:node shared ./shared

# 5. 复制预编译的原生二进制文件
COPY --from=ech-build --chown=node:node /out/kazumi-ech ./bin/kazumi-ech
COPY --from=hls-build --chown=node:node /build/bin/ ./bin/

# 6. 复制运行时必要的脚本和原生源码
COPY --chown=node:node native/hls ./native/hls
COPY --chown=node:node scripts/build-hls.mjs ./scripts/build-hls.mjs

# 7. 复制 Go 开源许可证合规文件
COPY --from=ech-build --chown=node:node /usr/local/go/LICENSE ./bin/GO-LICENSE

# 8. 复制 Alpine 原生系统 CA 证书
COPY --from=ech-build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt

# 9. 复制辅助运行脚本
COPY --chown=node:node scripts/check-ech.mjs ./scripts/check-ech.mjs
COPY --chown=node:node scripts/update-metadata.mjs ./scripts/update-metadata.mjs

# 10. 证书验证 + 初始化 Chromium NSS 信任库
RUN openssl verify -purpose sslserver -CAfile /etc/ssl/certs/ca-certificates.crt \
      /app/server/certificates/sslcom-tls-issuing-rsa-r1.crt \
    && mkdir -p /home/node/.pki/nssdb /app/data /app/bin \
    && certutil -N --empty-password -d sql:/home/node/.pki/nssdb \
    && certutil -A -d sql:/home/node/.pki/nssdb -n 'SSL.com TLS Issuing RSA CA R1' -t 'C,,' \
      -i /app/server/certificates/sslcom-tls-issuing-rsa-r1.crt \
    && chown -R node:node /home/node/.pki /app/data /ms-playwright \
    && echo "✅ 证书信任链配置完成"

# 切换至非 root 用户运行，符合容器安全最佳实践
USER node

EXPOSE 3000

# 轻量健康检查，无需额外安装 curl/wget
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "server/index.js"]
