# 第一阶段：构建基础环境（可选，若需编译原生模块则使用，本项目零依赖可直接跳过此步或使用轻量镜像）
# 由于项目声明“零第三方依赖”，我们可以直接使用 node:18-alpine 作为基础镜像并复制代码

FROM --platform=$BUILDPLATFORM node:18-alpine

# 设置工作目录为 /app
WORKDIR /app

# 复制 package.json 和 package-lock.json (如果有)
COPY package*.json ./

# 安装依赖 (虽然该项目无依赖，但保留此步骤以防万一)
RUN npm ci --only=production || npm install --only=production

# 复制所有源代码到 /app
# 关键点：确保 server 文件夹在 /app/server 下
COPY server ./server
COPY web ./web

# 暴露端口
EXPOSE 8000

# 设置环境变量
ENV NODE_ENV=production
ENV TZ=Asia/Shanghai

# 启动应用
# 注意：这里使用相对路径或基于 WORKDIR 的路径
CMD ["node", "web/app.js","server/src/main.js"]
