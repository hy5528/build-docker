# =============================================================================
# Stage 1: Frontend Build
# =============================================================================
FROM node:20-slim AS frontend-builder
LABEL org.opencontainers.image.source="https://github.com/txwebroot/VideoX"
LABEL org.opencontainers.image.description="VideoX - Powerful Video Navigation and Streaming Plugin"
LABEL org.opencontainers.image.licenses=MIT
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN echo "VITE_API_BASE_URL=/api" > .env.production
RUN npm run build

# =============================================================================
# Stage 2: Backend Build (Obfuscation)
# =============================================================================
FROM node:20-slim AS backend-builder
WORKDIR /app/backend

# 安装全量依赖 (包含混淆引擎)
COPY backend-nodejs/package*.json ./
RUN npm install

# 复制后端源码并执行混淆
COPY backend-nodejs/ ./
RUN npm run build

# =============================================================================
# Stage 3: Runtime
# =============================================================================
FROM node:20-slim
WORKDIR /app

# 安装运行时工具 (curl 用于下载，xz-utils 用于解压 ffmpeg.tar.xz)
RUN apt-get update && apt-get install -y curl xz-utils tar && rm -rf /var/lib/apt/lists/*

# 复制后端生产依赖 (不含混淆引擎，减小体积)
WORKDIR /app/backend
COPY backend-nodejs/package*.json ./
RUN npm install --production

# ⚠️ 关键点：仅从构建阶段复制混淆后的代码 (backend-build)
COPY --from=backend-builder /app/backend-build ./

# 静态资源服务 (从前端构建阶段复制)
# 注意：server.js 在混淆后已位于当前目录
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# 设置运行时环境
ENV NODE_ENV=production
ENV PORT=3100

EXPOSE 3100

# 运行混淆后的入口文件
CMD ["node", "server.js"]
