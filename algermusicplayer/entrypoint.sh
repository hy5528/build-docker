#!/bin/sh

# 设置错误时退出
set -e

echo "🚀 初始化应用..."

# 检查并创建必要的目录
mkdir -p /var/log/supervisor /etc/supervisor/conf.d /data

# 复制 supervisor 配置
cp /app/supervisord.conf /etc/supervisor/conf.d/


echo "✅ 初始化完成，启动服务..."

# 启动 supervisor
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
