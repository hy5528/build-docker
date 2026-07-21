
# Use Bun's official image
FROM oven/bun:1 AS base
WORKDIR /app
# Install dependencies with bun
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --no-save --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Production image, copy all the files and run next
FROM base AS runner


WORKDIR /app



# 从 base 阶段复制已安装的 node_modules 和源代码
# 注意：如果进行了编译，这里应该复制 dist/ 或 build/ 目录
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/bun.lockb ./bun.lockb

# 如果有构建产物，取消下面注释
# COPY --from=base /app/dist ./dist




# 暴露端口 (假设应用运行在 3000 端口，请根据实际情况修改)
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 启动命令
# 如果是 TypeScript 项目，Bun 可以直接运行 ts 文件，或者运行编译后的 js
CMD ["bun", "run", "start"]
