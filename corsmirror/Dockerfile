# 第一阶段：构建阶段 (Builder)
FROM --platform=$BUILDPLATFORM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制依赖配置文件（利用缓存机制，若 package.json 未变则跳过 npm install）
COPY package*.json ./

# 安装所有依赖（包括开发依赖，用于构建）
RUN npm install

# 复制源代码
COPY . .

# 执行构建命令（如 TypeScript 编译、前端打包等）
RUN npm run build

# 第二阶段：运行阶段 (Production)
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 仅复制生产环境所需的依赖和构建产物
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# 创建非 root 用户以提升安全性
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# 声明容器监听的端口
EXPOSE 8788

# 启动命令
CMD ["node", "dist/main.js"]
