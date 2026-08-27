# VideoX
-一个专注于“采集资源 + 前台展示播放 + 后台管理采集”的轻量 CMS，基于 Node.js、Express、EJS、MySQL 和 Sequelize 实现。
- 启动后访问 http://服务器IP:3800。
- 用户名：admin 密码：ww123456

```text
services:
  app:
    image: ghcr.io/notpeppa/simplecms:latest
    container_name: simplecms-app
    restart: unless-stopped
    ports:
      - "3800:3000"
    environment:
      PORT: 3000
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: simplecms
      DB_USER: simplecms
      DB_PASSWORD: simplecms123
      SESSION_SECRET: change-me
      INIT_ADMIN_USERNAME: admin
      INIT_ADMIN_PASSWORD: ww123456
    depends_on:
      mysql:
        condition: service_healthy

  mysql:
    image: ghcr.nju.edu.cn/hy5528/mariadb:latest
    container_name: simplecms-mysql
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: simplecms
      MYSQL_USER: simplecms
      MYSQL_PASSWORD: simplecms123
      MYSQL_ROOT_PASSWORD: root123456
    expose:
      - "3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "127.0.0.1", "-uroot", "-proot123456"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 20s

volumes:
  mysql_data:
```
