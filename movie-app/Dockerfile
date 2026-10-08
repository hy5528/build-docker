# --- 第一阶段：构建环境（仅安装依赖 + 前端打包） ---
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder

WORKDIR /app

# 1. 仅复制依赖清单，最大化利用缓存
COPY package*.json ./

# 2. 安装全部依赖（包含构建工具），利用 npm 缓存加速重复构建
#    使用国内镜像源加速（可按需替换为你自己的镜像）
RUN npm config set registry https://registry.npmmirror.com/ \
  && npm install

# 3. 只复制构建前端所需的文件，避免 server.js / data 等变动导致前端重新打包
COPY vite.config.js ./vite.config.js
COPY tailwind.config.js ./tailwind.config.js
COPY postcss.config.js ./postcss.config.js
COPY index.html ./index.html
COPY public ./public
COPY src ./src

# 4. 构建前端
RUN npm run build


# --- 第二阶段：运行环境（仅包含运行所需依赖 + 构建产物） ---
FROM node:20-alpine

WORKDIR /app

# 1. 仅复制 package.json / package-lock 用于安装生产依赖
COPY package*.json ./

# 2. 仅安装生产环境依赖 (去除 vite, tailwind 等构建工具)
#    同样使用国内镜像源
RUN npm config set registry https://registry.npmmirror.com/ \
  && npm install --omit=dev

# 3. 从第一阶段复制构建好的前端静态资源
COPY --from=builder /app/dist ./dist

# 4. 复制后端入口文件及其依赖的本地模块
COPY server.js ./server.js
COPY iptv-cctv.js ./iptv-cctv.js

# 如需在容器内持久化本地数据（如 admin.json / sources.json），可挂载宿主机目录到 /app/data
# 这里仅创建目录，实际文件会在运行时生成
RUN mkdir -p /app/data

# 5. 暴露端口并启动
EXPOSE 3000
CMD ["node", "server.js"]
