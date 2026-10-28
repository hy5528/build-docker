# syntax=docker/dockerfile:1

# -----------------------------------------------------------------------------
# Stage 1: Build HLS native module
# -----------------------------------------------------------------------------
FROM --platform=$BUILDPLATFORM node:22-alpine AS hls-build

# Alpine 使用 apk 而不是 apt-get
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

# 执行构建脚本
RUN node scripts/build-hls.mjs

# -----------------------------------------------------------------------------
# Stage 2: Build ECH (Encrypted Client Hello) binary using Go
# -----------------------------------------------------------------------------
FROM --platform=$BUILDPLATFORM golang:1.26-alpine AS ech-build

WORKDIR /build
COPY native/ech/ ./

# CGO_ENABLED=0 确保静态链接，减小体积且无需 libc 依赖
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/kazumi-ech .

# -----------------------------------------------------------------------------
# Stage 3: Install Node.js dependencies (Dev & Prod)
# -----------------------------------------------------------------------------
FROM --platform=$BUILDPLATFORM node:22-alpine AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# -----------------------------------------------------------------------------
# Stage 4: Build Frontend
# -----------------------------------------------------------------------------
FROM dependencies AS build

COPY index.html vite.config.js ./
COPY src ./src
COPY shared ./shared

# 执行前端构建
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 5: Install Production-only Node.js dependencies
# -----------------------------------------------------------------------------
FROM --platform=$BUILDPLATFORM node:22-alpine AS production-dependencies

WORKDIR /app
COPY package.json package-lock.json ./
# 仅安装生产依赖，忽略 devDependencies
RUN npm ci --omit=dev && npm cache clean --force

# -----------------------------------------------------------------------------
# Stage 6: Final Runtime Image
# -----------------------------------------------------------------------------
FROM node:22-alpine AS runtime

# 设置环境变量
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    DATA_DIR=/app/data \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    NODE_EXTRA_CA_CERTS=/app/server/certificates/sslcom-tls-issuing-rsa-r1.crt

WORKDIR /app

# 1. 复制生产依赖
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules

# 2. 安装 Playwright Chromium Shell 及其系统依赖
# 注意：Alpine 使用 apk，且需要安装 playwright 所需的系统库
RUN apk update && apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      openssl \
      libnss3-tools \
    && ./node_modules/.bin/playwright install --with-deps --only-shell chromium \
    && chmod -R a+rX /ms-playwright \
    && rm -rf /var/cache/apk/*

# 3. 复制前端构建产物
COPY --from=build --chown=node:node /app/dist ./dist

# 4. 复制核心应用文件
COPY --chown=node:node package.json LICENSE ./
COPY --chown=node:node server ./server
COPY --chown=node:node shared ./shared

# 5. 复制原生二进制文件
COPY --from=ech-build --chown=node:node /out/kazumi-ech ./bin/kazumi-ech
COPY --from=hls-build --chown=node:node /build/bin/ ./bin/

# 6. 复制必要的脚本和原生源码（如果运行时动态编译或需要）
# 注意：如果 hls-build 阶段已经生成了最终二进制，通常不需要再复制源码，除非脚本需要在运行时执行
COPY --chown=node:node native/hls ./native/hls
COPY --chown=node:node scripts/build-hls.mjs ./scripts/build-hls.mjs

# 7. 复制 Go 许可证
COPY --from=ech-build --chown=node:node /usr/local/go/LICENSE ./bin/GO-LICENSE

# 8. 配置 SSL 证书信任链
# Node bundles its own roots; Go's TLS client needs the system CA bundle.
COPY --from=ech-build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt

# 9. 复制其他运行时脚本
COPY --chown=node:node scripts/check-ech.mjs ./scripts/check-ech.mjs
COPY --chown=node:node scripts/update-metadata.mjs ./scripts/update-metadata.mjs

# 10. 验证证书并初始化 NSS 数据库 (用于 Chromium/Playwright)
RUN openssl verify -purpose sslserver -CAfile /etc/ssl/certs/ca-certificates.crt \
      /app/server/certificates/sslcom-tls-issuing-rsa-r1.crt \
    && mkdir -p /home/node/.pki/nssdb /app/data \
    && certutil -N --empty-password -d sql:/home/node/.pki/nssdb \
    && certutil -A -d sql:/home/node/.pki/nssdb -n 'SSL.com TLS Issuing RSA CA R1' -t 'C,,' \
      -i /app/server/certificates/sslcom-tls-issuing-rsa-r1.crt \
    && chown -R node:node /home/node/.pki /app/data

# 切换到非 root 用户以提高安全性
USER node

EXPOSE 3000

# 健康检查：使用 Node.js 原生 fetch API
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "server/index.js"]
