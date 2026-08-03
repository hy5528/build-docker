# GoFilm
- 下载https://github.com/hy5528/build-docker/blob/main/film/film.zip
- 将film 文件夹完整的上传到服务器的 ` /opt/` 目录下 (放在其他目录下时需同步修改 `Dockerfile` 以及 `docker-compose.yml` 文件中的相关路径)
- 在 `/opt/film/` 目录下执行命令 `docker-compose up -d` 
- 在浏览器中访问管理后台: http://xxx.xxx.xxx/manage  , 
- 登录 默认 用户名 密码: `admin admin`
- 使用后台功能中的采集管理功能进行影视数据采集 (采集任务开启后需等待一段时间)
- 浏览器中访问前台地址查看效果, 例: [http://xxx.xxx.xxx/index](http://xxx.xxx.xxx/index) (点击管理后台的logo菜单可直接跳转到前台页面)
- 也可以到原项目https://github.com/ProudMuBai/GoFilm.git 下载。
- 下载后用下面的docker-compose.yml代替film中的docker-compose.yml，然后将film 文件夹完整的上传到服务器的 ` /opt/` 目录，在 `/opt/film/` 目录下执行命令 `docker-compose up -d` 。
- 以上操作减少本地构建相关docker镜像时出错的可能。

```text
services:
  nginx:
    container_name: film_nginx
    image: ghcr.nju.edu.cn/hy5528/nginx:alpine
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
    image: ghcr.nju.edu.cn/hy5528/mariadb:latest
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
    image: ghcr.nju.edu.cn/hy5528/redis:alpine
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
    driver: bridge

```
