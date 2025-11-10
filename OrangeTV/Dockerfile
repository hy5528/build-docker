# 多架构构建 Dockerfile
# 使用 Docker Buildx 进行多架构构建：
# docker buildx build --platform linux/amd64,linux/arm64 -t your-image:tag --push .
# 或单一架构构建：
# docker buildx build --platform linux/amd64 -t your-image:tag --load .

# 声明构建参数，用于多架构构建
ARG BUILDPLATFORM
ARG TARGETPLATFORM

# ---- 第 1 阶段：安装依赖 ----
FROM --platform=$BUILDPLATFORM node:20-alpine AS deps

# 启用 corepack 并激活 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 先复制所有文件
COPY . .

# 然后检查文件
RUN echo "文件列表:" && ls -la && \
    echo "检查 tsconfig.json:" && \
    if [ -f "tsconfig.json" ]; then \
        echo "tsconfig.json 存在"; \
    else \
        echo "tsconfig.json 不存在"; \
        echo "查找所有文件:"; \
        find . -type f -name "*tsconfig*"; \
        exit 1; \
    fi


# 安装所有依赖
RUN pnpm install --frozen-lockfile

# ---- 第 2 阶段：构建项目 ----
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
# 复制全部源代码
COPY . .

ENV DOCKER_ENV=true

# 生成生产构建
RUN pnpm run build

# ---- 第 3 阶段：生成运行时镜像 ----
FROM node:20-alpine AS runner

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV DOCKER_ENV=true

# 从构建器中复制 standalone 输出
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# 从构建器中复制 scripts 目录
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
# 从构建器中复制启动脚本和WebSocket相关文件
COPY --from=builder --chown=nextjs:nodejs /app/start.js ./start.js
COPY --from=builder --chown=nextjs:nodejs /app/websocket.js ./websocket.js
COPY --from=builder --chown=nextjs:nodejs /app/production.js ./production.js
COPY --from=builder --chown=nextjs:nodejs /app/production-final.js ./production-final.js
COPY --from=builder --chown=nextjs:nodejs /app/standalone-websocket.js ./standalone-websocket.js
# 从构建器中复制 public 和 .next/static 目录
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# 从构建器中复制 package.json 和 package-lock.json，用于安装额外依赖
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/pnpm-lock.yaml ./pnpm-lock.yaml
# 复制 tsconfig.json 以确保路径解析正确
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json

# 安装必要的WebSocket依赖（兼容多架构）
USER root
RUN corepack enable && corepack prepare pnpm@latest --activate && \
    # 使用 --no-optional 避免某些架构下的可选依赖问题
    pnpm install --prod --no-optional ws && \
    # 清理安装缓存减小镜像大小
    pnpm store prune

# 创建健康检查脚本（在切换用户之前以root权限创建）
RUN echo '#!/usr/bin/env node\n\
const http = require("http");\n\
const options = {\n\
  hostname: "localhost",\n\
  port: 3000,\n\
  path: "/api/health",\n\
  method: "GET",\n\
  timeout: 5000\n\
};\n\
\n\
const req = http.request(options, (res) => {\n\
  if (res.statusCode === 200) {\n\
    console.log("Health check passed");\n\
    process.exit(0);\n\
  } else {\n\
    console.log(`Health check failed with status: ${res.statusCode}`);\n\
    process.exit(1);\n\
  }\n\
});\n\
\n\
req.on("error", (err) => {\n\
  console.log(`Health check error: ${err.message}`);\n\
  process.exit(1);\n\
});\n\
\n\
req.on("timeout", () => {\n\
  console.log("Health check timeout");\n\
  req.destroy();\n\
  process.exit(1);\n\
});\n\
\n\
req.setTimeout(5000);\n\
req.end();' > /app/healthcheck.js && \
    chmod +x /app/healthcheck.js && \
    chown nextjs:nodejs /app/healthcheck.js

# 切回非特权用户
USER nextjs

# 暴露HTTP和WebSocket端口
EXPOSE 3000 3001

# 添加健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node /app/healthcheck.js

# 设置WebSocket端口环境变量
ENV WS_PORT=3001

# 使用最终的生产环境脚本，分离WebSocket服务
CMD ["node", "production-final.js"]
