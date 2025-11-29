#!/bin/bash
echo -e "===================1. 启动nginx===========================\n"
nginx -s reload 2>/dev/null || nginx -c /etc/nginx/nginx.conf
echo -e "nginx启动成功...\n"




echo -e "############################################################\n"
echo -e "容器启动成功..."
echo -e "\n请先访问80端口，..."
echo -e "############################################################\n"

crond -f >/dev/null
exec "$@"
