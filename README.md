自用镜像,测试用。
---
# mopidy-docker

Run Mopidy in Docker

Mopidy plugins：
Mopidy-Local
Mopidy-Iris
Mopidy-Mpd
Mopidy-Muse
Mopidy-Soundcloud

```text
services:
  mopidy:
    image: hy5528/mopidy:latest
    container_name: mopidy
    devices:
      - /dev/snd:/dev/snd
    environment:
      - "TZ=Asia/Shanghai"
    ports:
      - 6680:6680
      - 6600:6600
    volumes:
      - /run/udev:/run/udev:ro
      - /opt/config:/root/.config
      - /opt/local:/root/.local
      - /mnt:/music
    restart: always
```

# lunatv
kvrocks储存
```text
services:
  moontv-core:
    image: ghcr.nju.edu.cn/hy5528/lunatv66:latest
    container_name: moontv-core
    restart: always
    ports:
      - '3000:3000'
    environment:
      - USERNAME=admin
      - PASSWORD=123456
      - NEXT_PUBLIC_STORAGE_TYPE=kvrocks
      - KVROCKS_URL=redis://moontv-kvrocks:6666
    networks:
      - moontv-network
    depends_on:
      - moontv-kvrocks

  moontv-kvrocks:
    image: apache/kvrocks
    container_name: moontv-kvrocks
    restart: always
    volumes:
      - kvrocks-data:/var/lib/kvrocks
    networks:
      - moontv-network

networks:
  moontv-network:
    driver: bridge

volumes:
  kvrocks-data:

```
redis储存
```text
services:
  moontv-core:
    image: ghcr.nju.edu.cn/hy5528/lunatv66:latest
    container_name: moontv-core
    restart: always
    ports:
      - '3000:3000'
    environment:
      - USERNAME=admin
      - PASSWORD=123456
      - NEXT_PUBLIC_STORAGE_TYPE=redis
      - REDIS_URL=redis://moontv-redis:6379
    networks:
      - moontv-network
    depends_on:
      - moontv-redis

  moontv-redis:
    image: redis:alpine
    container_name: moontv-redis
    restart: always
    command: redis-server --save 60 1 --loglevel warning
    volumes:
      - ./data:/data
    networks:
      - moontv-network

networks:
  moontv-network:
    driver: bridge
```

# cmsmovie
前台: http://localhost:5000/
后台: http://localhost:5000/admin/login

管理员账户

默认账户配置在 config.py 中:
用户名: admin
密码: 123456
```text
docker run -d \
  --name cmsmovie \
  -p 5000:5000 \
  --restart=always \
  -v /opt/maccms/instance:/app/instance \
  -v /opt/maccms/backups:/app/backups \
  -v /opt/maccms/app/static/uploads:/app/app/static/uploads \
  -v /opt/maccms/logs:/app/logs \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=123456 \
  ghcr.nju.edu.cn/hy5528/flask_maccms66:latest

```
# NextTV
http://你的IP:5500

```text



```

# splayer
```text
docker run -d --name SPlayer --restart=always -p 25884:25884 ghcr.nju.edu.cn/hy5528/splayer66:latest

```
# moekoemusic
```text
docker run -d --name moekoemusic --restart=always -p 8650:8080 ghcr.nju.edu.cn/hy5528/moekoemusic66:latest

```
# yesplaymusic
```text
docker run -d --name yesplaymusic --restart=always -p 5300:80 ghcr.nju.edu.cn/hy5528/yesplaymusic66:latest

```

# mmPlayer
```text
docker run -d --name mmPlayer --restart=always -v /home/docker/music/cache:/var/www/html/cache -v /home/docker/music/temp:/var/www/html/temp -p 268:80 ghcr.nju.edu.cn/hy5528/mmplayer66:latest

```
