

# 第一阶段：构建阶段

FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

# 设置工作目录

WORKDIR /app

# 复制依赖文件，利用缓存层

COPY package*.json ./

# 安装所有依赖（包括 devDependencies，因为构建需要）

RUN npm isntall

# 复制源代码

COPY . .

# 执行构建命令，生成 dist 目录

RUN npm run build

# 第二阶段：生产运行阶段

FROM node:18-alpine

# 设置工作目录

WORKDIR /app

# 复制构建产物和必要的 node_modules

# 注意：如果项目是纯静态前端由 Nginx 托管，此阶段应使用 nginx 镜像

# 这里假设是一个 Node.js 后端服务或 SSR 应用

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# 创建非 root 用户以提高安全性

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# 声明端口

EXPOSE 3000

# 启动命令

CMD ["node", "dist/index.js"]
