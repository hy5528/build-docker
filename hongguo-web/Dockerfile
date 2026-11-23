# build 参数：默认与 latest tag 一致；CI 用 --build-arg 覆盖
ARG NODE_VERSION=22-slim

# ---------- Stage 1: runtime ----------
FROM node:${NODE_VERSION}

# 容器内项目根
WORKDIR /app

# 时区设为 Asia/Shanghai（日志可读性，不影响业务逻辑）
# 数据根目录 /app/data：单卷挂载点，承载 config / stream-cache / download
ENV TZ=Asia/Shanghai \
    LANG=C.UTF-8 \
    # ---- 业务环境变量：覆盖 server/config/config.json 的默认值 ----
    # 监听所有网卡，否则容器外访问不到
    BIND_HOST=0.0.0.0 \
    # 端口与 EXPOSE 对齐
    PORT=8000 \
    # 容器内没有浏览器，关掉自动打开
    HG_OPEN_BROWSER=false \
    # ---- 数据路径全部收进 /app/data/，单卷挂载即可 ----
    # config.json 路径（覆盖默认的 server/config/config.json）
    HONGGUO_CONFIG=/app/data/config/config.json \
    # stream-cache 路径（覆盖默认的 server/stream-cache）
    HONGGUO_STREAM_CACHE=/app/data/stream-cache \
    # 下载目录路径（覆盖默认的 download）
    HONGGUO_DOWNLOAD_DIR=/app/data/download

# 显式装 libatomic1 + gosu：
#   - libatomic1：Debian slim 不一定自带，确保即便将来换 Node 24/26
#     也不会再撞原仓库 v1.1.7+ 那个 libatomic.so.1 缺失的坑
#   - gosu：entrypoint 里以 root 修属主后降权到 node 用户
RUN apt-get update && \
    apt-get install -y --no-install-recommends libatomic1 ca-certificates gosu && \
    rm -rf /var/lib/apt/lists/*

# 先复制 package.json（项目零依赖，但保留这一步以便将来加依赖时能利用层缓存）
COPY package.json ./

# 复制业务源码：server/ + web/。源码留在镜像内 /app/server/，不会被挂载覆盖
COPY server ./server
COPY web ./web

# 复制启动脚本（保留 start.sh / stop.sh 便于容器内排错；pack.sh 不需要）
COPY scripts/start.sh scripts/stop.sh ./scripts/

# 复制 docker entrypoint 脚本：负责在卷挂载后创建数据子目录并初始化 config.json
# 原因：VOLUME /app/data 会让宿主机卷覆盖镜像内 /app/data/ 下所有内容，
#       构建时 mkdir 出来的子目录全会被清空。必须在容器启动后、Node 拉起前补回。
COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh scripts/start.sh scripts/stop.sh && \
    chown -R node:node /app

# 健康检查：检查 HTTP 端口能响应（不依赖具体路由，404 也算进程活着）
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "const http=require('http');const r=http.get({host:'127.0.0.1',port:Number(process.env.PORT||8000),path:'/',timeout:3000},x=>{process.exit(x.statusCode<500?0:1)}).on('error',()=>process.exit(1)).on('timeout',()=>{r.destroy();process.exit(1)});"

# 声明端口（与 PORT 环境变量保持一致；如改 PORT 同步改 EXPOSE 与 docker-compose）
EXPOSE 8000

# 单卷挂载点：所有运行时数据（config / stream-cache / download）都在这里
VOLUME ["/app/data"]

# 注意：故意不设 USER node —— entrypoint 需要 root 来 chown 卷目录，
#       chown 完后再用 gosu 降权到 node。这样宿主机挂载点权限不对时也能自动修复。
# ENTRYPOINT 接管启动，CMD 作为参数透传给 entrypoint
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "server/src/main.js"]
