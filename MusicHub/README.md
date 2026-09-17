# MusicHub
- 自托管音乐流媒体服务器：兼容 MusicFree 插件生态，同时提供 OpenSubsonic 服务端，自带一个好看的 Web 播放器。Docker 一键部署，你的音乐、歌单、榜单、电台全部聚合在一个界面里。
- http://你的IP:8300
```text
services:
  musichub:
    image: ghcr.nju.edu.cn/hy5528/musichub66:latest
    container_name: musichub
    ports:
      - "8300:8000"          # 左边端口可自行修改，如 "8080:8000"
    volumes:
      - /www/musichub/data:/app/data         # 数据目录（数据库、插件配置、封面缓存、日志等）
      - /www/musichub/downloads:/app/downloads   # 下载目录
      - /www/musichub/playlists:/app/playlists   # 播放列表目录（M3U）
      - /www/music:/app/music           # 本地音乐目录（本地曲库扫描）
    environment:
      - PUID=1000                # 与宿主机用户对齐，避免挂载目录权限问题
      - PGID=1000
      - TZ=Asia/Shanghai
    restart: unless-stopped

```
