# Songloft
- Songloft 是一款面向个人用户的自托管工具，定位为帮助用户管理自己合法拥有的音乐文件。
- 启动后访问 http://服务器IP:58091。

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
