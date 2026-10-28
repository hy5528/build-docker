# syntax=docker/dockerfile:1

# -----------------------------------------------------------------------------
# Stage 1: Build HLS native module
# -----------------------------------------------------------------------------
FROM --platform=$BUILDPLATFORM node:22-alpine AS hls-build

# Alpine 原生编译依赖，适配 musl libc
RUN apk update && apk add --no-cache \
    build-base \
    pkgconfig \
    patch \
    ca-certificates \
    python3 \
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

# 安装 Alpine 版 CA 证书，保证构建阶段网络请求可信
RUN apk add --no-cache ca-certificates

WORKDIR /build
COPY native/ech/ ./

# 完全静态编译，不依赖任何系统动态库，体积更小、兼容性更强
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/kazumi-ech .

# -----------------------------------------------------------------------------
# Stage 3: Install Node.js full dependencies (Dev + Prod)
# -----------------------------------------------------------------------------
FROM --platform=$BUILDPLATFORM node:22-alpine AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
# 严格依据 lock 文件安装，保证依赖版本一致性
RUN npm ci

# -----------------------------------------------------------------------------
# Stage 4: Build Frontend with Vite
# -----------------------------------------------------------------------------
FROM dependencies AS build

COPY index.html vite.config.js ./
COPY src ./src
COPY shared ./shared

# 执行前端生产构建，输出优化后的静态资源
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 5: Install Production-only Node.js dependencies
# -----------------------------------------------------------------------------
FROM --platform=$BUILDPLATFORM node:22-alpine AS production-dependencies

WORKDIR /app
COPY package.json package-lock.json ./
# 仅安装生产依赖，完全移除开发阶段依赖，大幅缩减 node_modules 体积
RUN npm ci --omit=dev && npm cache clean --force

# -----------------------------------------------------------------------------
# Stage 6: Final Minimal Runtime Image
# -----------------------------------------------------------------------------
FROM node:22-alpine AS runtime

# 全局环境变量统一声明
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    DATA_DIR=/app/data \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    NODE_EXTRA_CA_CERTS=/app/server/certificates/sslcom-tls-issuing-rsa-r1.crt

WORKDIR /app

# 复制生产环境 Node 依赖
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules

# 安装 Playwright Chromium 运行依赖 + 证书工具
RUN apk update && apk add --no-cache \
      chromium \
      nss \
      nss-tools \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      openssl \
    && ./node_modules/.bin/playwright install --with-deps --only-shell chromium \
    && chmod -R a+rX /ms-playwright \
    && rm -rf /var/cache/apk/* /tmp/* /root/.npm

# 复制前端构建产物
COPY --from=build --chown=node:node /app/dist ./dist

# 复制核心业务文件
COPY --chown=node:node package.json LICENSE ./
COPY --chown=node:node server ./server
COPY --chown=node:node shared ./shared

# 复制预编译的原生二进制文件
COPY --from=ech-build --chown=node:node /out/kazumi-ech ./bin/kazumi-ech
COPY --from=hls-build --chown=node:node /build/bin/ ./bin/

# 复制运行时必要的脚本和原生源码
COPY --chown=node:node native/hls ./native/hls
COPY --chown=node:node scripts/build-hls.mjs ./scripts/build-hls.mjs

# 复制 Go 开源许可证合规文件
COPY --from=ech-build --chown=node:node /usr/local/go/LICENSE ./bin/GO-LICENSE

# 复制 Alpine 原生系统 CA 证书，保证 Go TLS 客户端信任根证书
COPY --from=ech-build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt

# 复制辅助运行脚本
COPY --chown=node:node scripts/check-ech.mjs ./scripts/check-ech.mjs
COPY --chown=node:node scripts/update-metadata.mjs ./scripts/update-metadata.mjs

# 证书验证 + 初始化 Chromium NSS 信任库，导入自定义 CA 证书
RUN openssl verify -purpose sslserver -CAfile /etc/ssl/certs/ca-certificates.crt \
      /app/server/certificates/sslcom-tls-issuing-rsa-r1.crt \
    && mkdir -p /home/node/.pki/nssdb /app/data /app/bin \
    && certutil -N --empty-password -d sql:/home/node/.pki/nssdb \
    && certutil -A -d sql:/home/node/.pki/nssdb -n 'SSL.com TLS Issuing RSA CA R1' -t 'C,,' \
      -i /app/server/certificates/sslcom-tls-issuing-rsa-r1.crt \
    && chown -R node:node /home/node/.pki /app/data /ms-playwright

# 切换至非 root 用户运行，符合容器安全最佳实践
USER node

EXPOSE 3000

# 轻量健康检查，无需额外安装 curl/wget
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "server/index.js"]
