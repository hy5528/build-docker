# 第一阶段：构建基础环境（可选，若需编译原生模块则使用，本项目零依赖可直接跳过此步或使用轻量镜像）
# 由于项目声明“零第三方依赖”，我们可以直接使用 node:18-alpine 作为基础镜像并复制代码

FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json (如果有)
COPY package*.json ./

# 安装依赖 (虽然 dependencies 为空，但保留此步骤以符合规范，或确保 devDependencies 不被安装到生产环境)
# 对于纯 Node.js 无依赖项目，这一步实际上很快
RUN npm ci --only=production || npm install --only=production

# 第二阶段：生产运行镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装必要的系统依赖（如需要 ffmpeg 用于视频处理，但根据描述该项目主要是代理/播放，若无需转码可省略）
# RUN apk add --no-cache ffmpeg

# 从构建阶段复制 node_modules 和源代码
# 如果上面 builder 阶段没做特别处理，这里直接复制所有文件更简单
COPY . .

# 如果使用了 builder 阶段分离 node_modules，则使用以下命令：
# COPY --from=builder /app/node_modules ./node_modules

# 暴露端口 (默认内部端口为 8787，参考 docker-compose 配置)
EXPOSE 8000

# 设置环境变量
ENV NODE_ENV=production
ENV TZ=Asia/Shanghai
ENV DATA_DIR=/app/data

# 创建数据目录并设置权限
RUN mkdir -p /app/data && chown -R node:node /app

# 切换到非 root 用户运行以提高安全性
USER node

# 启动应用
CMD ["node", "server/src/main.js"]

