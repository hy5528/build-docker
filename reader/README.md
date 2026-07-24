# reader
http://你的IP:4396

单用户
```text

docker run -d --name=reader -v /www/reader/storage:/storage -v /www/DockerHome/reader/logs:/logs -p 4396:8080 ghcr.nju.edu.cn/hy5528/reader66:latest

```
多用户
```text
services:
  reader:

    image: ghcr.io/hy5528/reader66:latest
    container_name: reader #容器名 可自行修改
    restart: always
    ports:
      - 4396:8080 #4396端口映射可自行修改
    networks:
      - share_net
    volumes:
      - /home/reader/logs:/logs #log映射目录 /home/reader/logs 映射目录可自行修改
      - /home/reader/storage:/storage #数据映射目录 /home/reader/storage 映射目录可自行修改
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - READER_APP_USERLIMIT=50 #用户上限,默认50
      - READER_APP_USERBOOKLIMIT=200 #用户书籍上限,默认200
      - READER_APP_CACHECHAPTERCONTENT=true #开启缓存章节内容 V2.0
      # 如果启用远程webview，需要取消注释下面的 remote-webview 服务
      # - READER_APP_REMOTEWEBVIEWAPI=http://remote-webview:8050 #开启远程webview
      # 下面都是多用户模式配置
      - READER_APP_SECURE=true #开启登录鉴权，开启后将支持多用户模式
      - READER_APP_SECUREKEY=12345678  #管理员密码  建议修改
      - READER_APP_INVITECODE=12345678 #注册邀请码 建议修改,如不需要可注释或删除

networks:
  share_net:
    driver: bridge

```
