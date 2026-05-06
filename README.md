自用镜像,测试用。
---
# mopidy-docker
‌Mopidy‌ 是一款用 Python 编写的‌可扩展音乐服务器‌。

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
基于 MoonTV 深度二次开发的全功能影视聚合播放平台。

kvrocks储存
```text
services:
  moontv-core:
    image: ghcr.io/hy5528/lunatv66:latest
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
    image: ghcr.io/hy5528/lunatv66:latest
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
# GoFilm
- 下载https://github.com/hy5528/build-docker/blob/main/film/film.zip
- 将film 文件夹完整的上传到服务器的 ` /opt/` 目录下 (放在其他目录下时需同步修改 `Dockerfile` 以及 `docker-compose.yml` 文件中的相关路径)
- 在 `/opt/film/` 目录下执行命令 `docker compose up -d` (后台运行服务)
- 在浏览器中访问管理后台: http://xxx.xxx.xxx/manage  , 
- 登录 默认 用户名 密码: `admin admin`
- 使用后台功能中的采集管理功能进行影视数据采集 (采集任务开启后需等待一段时间)
- 浏览器中访问前台地址查看效果, 例: [http://xxx.xxx.xxx/index](http://xxx.xxx.xxx/index) (点击管理后台的logo菜单可直接跳转到前台页面)
- 也可以到原项目https://github.com/ProudMuBai/GoFilm.git下载。
- 下载后用下面的docker-compose.yml代替film中的docker-compose.yml，然后将film 文件夹完整的上传到服务器的 ` /opt/` 目录，在 `/opt/film/` 目录下执行命令 `docker compose up -d` 。
- 以上操作减少本地构建相关docker镜像时出错的可能。

```text
services:
  nginx:
    container_name: film_nginx
    image: nginx
    restart: always
    ports:
      - 3600:80
    volumes:
      - /opt/film/data/nginx/html:/usr/share/nginx/html
      - /opt/film/data/nginx/nginx.conf:/etc/nginx/nginx.conf
      - /opt/film/data/nginx/logs:/var/log/nginx
    networks:
      - film-network
    depends_on:
      - film

  film:
    image: ghcr.nju.edu.cn/hy5528/film66:latest
    container_name: film_api
    restart: always
    environment:
      MYSQL_HOST: mysql
      MYSQL_PORT: 3661
      MYSQL_USER: root
      MYSQL_PASSWORD: root
      MYSQL_DBNAME: FilmSite
      REDIS_HOST: redis
      REDIS_PORT: 3662
    ports:
      - 3601:3601
    networks:
      - film-network
    depends_on:
      - mysql
      - redis
    command: [
          './main',
    ]

  mysql:
    container_name: film_mysql
    image: dpvduncan/mariadb:latest
    restart: always
    ports:
    - 3610:3306
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: FilmSite
    networks:
      - film-network
    command: [
          'mysqld',
          '--default-storage-engine=INNODB',
          # '--innodb-buffer-pool-size=128M',
          # '--character-set-server=utf8mb4',
          # '--collation-server=utf8mb4_unicode_ci',
          '--default-time-zone=+8:00',
          '--lower-case-table-names=1'
        ]

  redis:
    container_name: film_redis
    image: redis:alpine
    restart: always
    ports:
      - 3620:6379
    volumes:
      - /opt/film/data/redis/redis.conf:/etc/redis/redis.conf
      - /opt/film/data/redis/data:/data
    networks:
      - film-network
    command: redis-server /etc/redis/redis.conf
networks:
  film-network:
    driver: bridgetest

```

# cmsmovie
实现了maccms10的视频功能

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
  ghcr.io/hy5528/flask_maccms66:latest

```
# NextTV
使用 Next.JS 重构LibreTV。

http://你的IP:5500

```text

docker run -d --name NextTV --restart=always -p 5500:3000 ghcr.io/hy5528/nexttv66:latest

```
# lxserver
LX Music 数据同步服务端和Web 播放器。

前台Web 播放器: http://localhost:9527/music

后台: http://localhost:9527

```text
docker run -d \
  -p 9527:9527 \
  -v /home/lx/data:/server/data \
  -v /home/lx/logs:/server/logs \
  -v /home/lx/cache:/server/cache \
  -v /mnt/music:/server/music \
  --name lx-sync-server \
  --restart=always \
  ghcr.io/hy5528/lxserver66:latest

```
# splayer
简约的跨平台音乐播放器。

api:http://你的IP:25884/api/netease
```text
docker run -d --name SPlayer --restart=always -p 25884:25884 ghcr.io/hy5528/splayer66:latest

```
# moekoemusic
```text
docker run -d --name moekoemusic --restart=always -p 8650:8080 ghcr.io/hy5528/moekoemusic66:latest

```
# yesplaymusic
高颜值的第三方网易云播放器。
```text
docker run -d --name yesplaymusic --restart=always -p 5300:80 ghcr.io/hy5528/yesplaymusic66:latest

```

# mmPlayer
由茂茂开源的一款在线音乐播放器。
```text
docker run -d --name mmPlayer --restart=always -v /home/docker/music/cache:/var/www/html/cache -v /home/docker/music/temp:/var/www/html/temp -p 268:80 ghcr.io/hy5528/mmplayer66:latest

```
