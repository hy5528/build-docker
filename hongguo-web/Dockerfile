# 使用官方 Node.js 22 Alpine 版本，

FROM --platform=$BUILDPLATFORM node:22-alpine

# 设置工作目录

WORKDIR /app

# 复制 package.json 和 package-lock.json (如果存在)

# 先复制这两个文件可以利用 Docker 缓存层，只有当依赖变化时才重新运行 npm install

COPY package*.json ./

# 安装生产环境依赖

# --production 参数确保不安装 devDependencies，减小镜像体积

RUN npm install --production

# 复制源代码到容器

COPY . .

# 暴露端口

EXPOSE 8630

# 启动命令

# 使用 exec 形式以确保信号能正确传递给 Node 进程

CMD ["node", "server/src/main.js"]
