# 使用 Node.js 24 以符合 package.json engines 要求
FROM node:24-bookworm

WORKDIR /app

# 如果 scripts 中使用了 puppeteer 需要启动浏览器，请取消下面几行的注释
# RUN apt-get update && apt-get install -y \
#     chromium \
#     --no-install-recommends \
#     && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
# 先复制 package.json 和 package-lock.json，利用 Docker 缓存层
COPY package*.json ./

# 安装所有依赖 (包括 devDependencies)
# npm ci 比 npm install 更快且更严格，适合 CI/CD 和容器构建
RUN npm ci

# 复制源代码
COPY . .

# 暴露端口
# 8787: Wrangler Dev Server (如果运行 dev:worker)
# 5173: Vite Dev Server (如果运行 dev)
# 3000: 自定义 dev-server.mjs (如果运行 dev:local)
EXPOSE 8787 5173 3000

# 启动命令
# 修正了之前的语法错误，正确调用 npm script
CMD ["npm", "run", "dev:local"]
