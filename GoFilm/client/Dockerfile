

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

# 阶段 2: 使用 Nginx 托管静态文件
FROM nginx:alpine
# 将构建好的 dist 内容复制到 Nginx 默认 html 目录
COPY --from=builder /app/dist /usr/share/nginx/html
# 如果需要自定义 Nginx 配置以支持 History 模式路由，可以在此处 COPY nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
