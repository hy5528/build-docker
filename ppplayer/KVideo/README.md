# PPPlayer
- PPPlayer 是一款基于 Python + pywebview 的开源视频聚合播放桌面应用
- http://你的IP:19527
```text
docker run -d --name ppplayer -p 19527:19527 \
  -v /opt/PPPlayer/ppplayer-data:/app/data \
  --restart unless-stopped \
  ghcr.io/hy5528/ppplayer66:latest
```
