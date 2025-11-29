#!/bin/bash



echo -e "===================2. 启动NeteaseCloudMusicApi ===========\n"
node app.js & 
echo -e "app.js启动成功...\n"

echo -e "===================3. check.sh ===========\n"
./check.sh &
echo -e "check.sh启动成功...\n"

# start unblock service in the background
npx unblockneteasemusic -p 543:443 -s -f ${NETEASE_SERVER_IP:-220.197.30.65} -o ${UNBLOCK_SOURCES:-kugou bodian pyncmd} 2>&1 &

# point the neteasemusic address to the unblock service
if ! grep -q "music.163.com" /etc/hosts; then
    echo "127.0.0.1 music.163.com" >> /etc/hosts
fi
if ! grep -q "interface.music.163.com" /etc/hosts; then
    echo "127.0.0.1 interface.music.163.com" >> /etc/hosts
fi
if ! grep -q "interface3.music.163.com" /etc/hosts; then
    echo "127.0.0.1 interface3.music.163.com" >> /etc/hosts
fi
if ! grep -q "interface.music.163.com.163jiasu.com" /etc/hosts; then
    echo "127.0.0.1 interface.music.163.com.163jiasu.com" >> /etc/hosts
fi
if ! grep -q "interface3.music.163.com.163jiasu.com" /etc/hosts; then
    echo "127.0.0.1 interface3.music.163.com.163jiasu.com" >> /etc/hosts
fi

# start the nginx daemon
nginx





echo -e "===================1. 启动nginx===========================\n"
nginx -s reload 2>/dev/null || nginx -c /etc/nginx/nginx.conf
echo -e "nginx启动成功...\n"

echo -e "############################################################\n"
echo -e "容器启动成功..."
echo -e "\n请先访问80端口，..."
echo -e "############################################################\n"

crond -f >/dev/null

exec "$@"
