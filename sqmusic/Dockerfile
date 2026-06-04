# 第一阶段：构建Vue项目
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

WORKDIR /app/vue

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码并构建
COPY . .
RUN npm run build

# 第二阶段：生产环境
FROM nginx:1.29.3-alpine3.22-slim AS app

# 复制自定义nginx配置（如有需要）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制打包结果
COPY --from=builder /app/vue/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
