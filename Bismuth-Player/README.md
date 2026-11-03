# Bismuth-Player
- Bismuth-Player 是一款基于苹果CMS 的影视播放器
- 启动后访问 http://服务器IP:3950
```text
docker run -d \
  --name bismplayer \
  --restart=always \
  -p 3950:80 \
  ghcr.nju.edu.cn/hy5528/bismuth-player66:latest
```
