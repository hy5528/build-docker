# lxserver
LX Music 数据同步服务端和Web 播放器。

前台Web 播放器: http://IP:9527

后台: http://IP:9527/admin

```text
docker run -d \
  -p 9527:9527 \
  -v /home/lx/data:/server/data \
  -v /home/lx/logs:/server/logs \
  -v /home/lx/cache:/server/cache \
  -v /mnt/music:/server/music \
  --name lx-sync-server \
  --restart=always \
  ghcr.nju.edu.cn/hy5528/yinyun-lxserver:latest

```
