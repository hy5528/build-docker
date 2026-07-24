# Songloft
- Songloft 是一款面向个人用户的自托管工具，定位为帮助用户管理自己合法拥有的音乐文件。
- 启动后访问 http://服务器IP:58091。
- 🎵 本地音乐管理 — 扫描本地目录，自动提取 MP3/FLAC/WAV/APE/OGG/M4A/WMA/AIF/AIFF/MKA 等格式的封面和元数据。
- 🎬 视频支持 — 扫描 MP4/MOV/M4V/MKV/WebM/AVI/TS 等视频容器并探测真实视频轨，客户端内渲染画面。

```text
docker run -d \
  --name songloft \
  -p 58091:58091 \
  -v /mnt/music:/app/music \
  -v /wwww/data:/app/data \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD='123456' \
  --restart unless-stopped \
  ghcr.io/hy5528/songloft66:latest
```
