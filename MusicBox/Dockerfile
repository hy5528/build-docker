# --- 阶段 1: 构建阶段 ---
FROM node:22-slim AS builder

# 安装编译 better-sqlite3 所需的工具
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 仅复制依赖相关文件
COPY package*.json ./

# 安装所有依赖（包括原生模块编译）
RUN npm install

# 复制源代码并构建
COPY . .

RUN npm run build

# 第二阶段：生产环境
FROM nginx:1.29.3-alpine3.22-slim AS app

WORKDIR /app

# 从构建阶段复制打包结果
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义nginx配置（如有需要）
# COPY nginx.conf /etc/nginx/nginx.con



EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]








