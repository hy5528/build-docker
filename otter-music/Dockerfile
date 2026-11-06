# ================= 阶段 1: 构建 =================
# 使用 node:22-alpine，指定平台以兼容多架构构建
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

# 安装编译原生模块所需的工具 (python3, make, g++)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# 【关键步骤 1】复制所有 package.json 文件
# 必须包含根目录及所有 workspace 子目录的 package.json，否则 npm ci 会失败
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY functions/package*.json ./functions/



# 【关键步骤 3】配置镜像源并安装依赖
# 1. registry: 使用国内镜像解决网络超时
# 2. npm ci: 严格根据 lock 文件安装，速度更快，适合 CI/Docker
# 3. --no-audit --no-fund: 跳过安全检查，显著加速
RUN npm config set registry https://registry.npmmirror.com \
    && npm cache clean --force \
    && npm ci --no-audit --no-fund

# 【关键步骤 4】复制源代码
# 此时 node_modules 已存在，COPY . . 不会覆盖它，但会添加源码
COPY . .

# 【关键步骤 5】执行构建
RUN npm run build

# ================= 阶段 2: 运行 =================
FROM nginx:alpine

# 可选：复制自定义 Nginx 配置以支持 SPA 路由
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制静态资源
# 请确认你的 build 脚本输出目录是 dist，如果是 build 或其他名称请修改此处
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
