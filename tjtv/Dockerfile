# ---- 构建阶段 ----
FROM  --platform=$BUILDPLATFORM node:22-alpine AS builder
WORKDIR /app

COPY app/package.json app/package-lock.json* ./
RUN npm ci --no-audit --no-fund

COPY app/ .
ENV DOCKER_BUILD=1
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- 运行阶段 ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8021
ENV HOSTNAME=0.0.0.0
ENV TJTV_DATA_DIR=/app/data
# 自动巡检（容器内置，用 Node 跑，不依赖 Python）
ENV AUTO_UPDATE=1
ENV AUTO_UPDATE_CRON=86400
ENV AUTO_UPDATE_TARGET=15

# 不做 apk add：不引入任何外部包，避免受限于镜像源可用性。
# 降权用 Alpine 自带的 busybox `su`，运行用户用镜像自带的 node（uid 1000）。

# 主程序
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# 内置源清单 + 巡检脚本 + 候选源池
# 【注意】这些文件必须放在挂载卷之外（/app/data 会被挂载覆盖），
# 否则容器启动后读不到。统一放 /app/defaults/，由入口脚本复制进数据目录。
COPY app/data/builtin-sources.json /app/defaults/builtin-sources.json
COPY scripts/auto-update.mjs /app/scripts/auto-update.mjs
COPY data/source-pool.txt /app/defaults/source-pool.txt

# 入口脚本
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# 源清单目录（首次启动时由 entrypoint 初始化）
RUN mkdir -p /app/data && chown -R node:node /app

# 以 root 启动：入口脚本需要先修挂载目录权限，之后会降权到 node 用户运行
# （NAS 挂载卷通常属于宿主机 owner，容器内非 root 用户默认无写权限）
EXPOSE 8021

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8021)+'/api/status').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/docker-entrypoint.sh"]
