# mmPlayer
由茂茂开源的一款在线音乐播放器。
```text
docker run -d --name mmPlayer --restart=always -v /home/docker/music/cache:/var/www/html/cache -v /home/docker/music/temp:/var/www/html/temp -p 268:80 ghcr.io/hy5528/mmplayer66:latest

```
