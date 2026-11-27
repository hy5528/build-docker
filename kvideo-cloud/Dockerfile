FROM node:22-bookworm

WORKDIR /app

# 安装 Wrangler 所需的系统依赖 (如果需要 puppeteer 等)
# RUN apt-get update && apt-get install -y chromium

# 复制依赖文件
COPY package*.json ./

# 安装所有依赖 (包括 devDependencies)
RUN npm ci

# 复制源代码
COPY . .

# 暴露端口
# 8787: Wrangler Dev Server
# 5173: Vite Dev Server (如果使用 npm run dev)
# 3000: 自定义 dev-server.mjs (如果使用 npm run dev:local)
EXPOSE 8787 5173 3000

# 默认命令：可以根据需要修改为 npm run dev:local 或 npm run dev:worker
CMD ["npm", "run", "npm run dev:local"]
