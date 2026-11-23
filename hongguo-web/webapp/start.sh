#!/bin/bash
# 红果短剧 Web 版 一键启动
set -e
WEBAPP_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$WEBAPP_DIR/.." && pwd)"
BRIDGE_DIR="${BRIDGE_DIR:-$ROOT_DIR/hongguoTV}"
CACHE_DIR="${CACHE_DIR:-$ROOT_DIR/.cache}"
mkdir -p "$CACHE_DIR"

# 0) 检查依赖
if [ ! -f "$BRIDGE_DIR/server/index.mjs" ]; then
  echo "[error] 未找到 hongguoTV bridge：$BRIDGE_DIR"
  echo "        请先克隆并安装："
  echo "          git clone https://github.com/N3urda/hongguoTV \"$BRIDGE_DIR\""
  echo "          npm ci --prefix \"$BRIDGE_DIR/server\""
  exit 1
fi

# 1) bridge 服务（端口 8787）
if ! curl -s --max-time 2 http://127.0.0.1:8787/health > /dev/null 2>&1; then
  echo "[start] 启动内容桥接服务 (8787)…"
  cd "$BRIDGE_DIR/server"
  setsid nohup node index.mjs --lan > "$CACHE_DIR/bridge.log" 2>&1 < /dev/null &
  sleep 2
else
  echo "[start] bridge 已在运行"
fi

# 2) webapp 服务（端口 8899）
if ! curl -s --max-time 2 http://127.0.0.1:8899/ > /dev/null 2>&1; then
  echo "[start] 启动网页版 (8899)…"
  cd "$WEBAPP_DIR"
  setsid nohup node server.js > "$CACHE_DIR/webapp_server.log" 2>&1 < /dev/null &
  sleep 1
else
  echo "[start] webapp 已在运行"
fi

echo "[start] 打开 http://127.0.0.1:8899"
