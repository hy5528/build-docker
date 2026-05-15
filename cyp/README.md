# cyp
控制你的播放器：基于网页的MPD客户端

http://你的IP:8083

```text

docker run -d \
  --name=cyp \
  --net="host" \
  -e PORT=8083  \
  --restart unless-stopped \
  ghcr.io/hy5528/cyp66:latest

```
