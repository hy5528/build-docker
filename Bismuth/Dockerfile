
# 阶段 1: 依赖安装与构建
FROM oven/bun:1 AS base
WORKDIR /app

# 复制依赖配置文件
COPY package.json ./

# 安装依赖 (利用 Bun 的高速安装特性)
# --frozen-lockfile 确保使用锁文件中的确切版本，保证构建一致性
RUN bun install --frozen-lockfile

# 复制源代码
COPY . .

# 如果有构建步骤(如 TypeScript 编译)，在此执行
RUN bun run build

# 阶段 2: 生产环境运行
FROM oven/bun:1-slim AS production
WORKDIR /app

# 创建非 root 用户以增强安全性
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# 从 base 阶段复制已安装的 node_modules 和源代码
# 注意：如果进行了编译，这里应该复制 dist/ 或 build/ 目录
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/bun.lockb ./bun.lockb
COPY --from=base /app/src ./src
# 如果有构建产物，取消下面注释
# COPY --from=base /app/dist ./dist

# 设置文件所有权
RUN chown -R appuser:appgroup /app

# 切换到非 root 用户
USER appuser

# 暴露端口 (假设应用运行在 3000 端口，请根据实际情况修改)
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 启动命令
# 如果是 TypeScript 项目，Bun 可以直接运行 ts 文件，或者运行编译后的 js
CMD ["bun", "run", "start"]
