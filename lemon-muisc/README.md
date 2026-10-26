# 柠檬音乐 · Lemon Music
- 面向飞牛 NAS、Docker 与自托管的 Web 音乐工具：本地音乐库、标签整理、试听播放，并兼容落雪（LX Music）、澜音、MusicFree、BakaMusic 音源插件。
- http://你的IP:7983
```text
services:
  lemon-music: # 服务名，一般不用改
    image: ghcr.nju.edu.cn/hy5528/lemon-muisc66:latest
    container_name: lemon-music # 容器名
    ports:
      - "7983:7983" # 宿主机端口:容器端口，改左边即可
    restart: unless-stopped # 异常退出后自动重启
    environment:
      PORT: "7983" # 容器内监听端口，需与上面 ports 右侧一致
      DOWNLOAD_PATH: /downloads # 容器内下载目录
      CONFIG_PATH: /config # 容器内配置与数据库目录
      # MUSIC_HOST_PATH: /volume1/music # 可选，界面展示用的宿主机音乐路径
      # DOWNLOADS_HOST_PATH: /volume1/downloads # 可选，界面展示用的宿主机下载路径
      # LEMON_PUBLIC_URL: http://192.168.1.8:7983 # 可选，DLNA 投屏拉流地址
    volumes:
      - ./data/music:/music # 音乐库：左边改成你的歌曲目录
      - ./data/downloads:/downloads # 下载保存目录
      - ./data/config:/config # 配置与数据库，

```
