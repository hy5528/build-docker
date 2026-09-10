- http://你的IP:1234/main.m3u
```text
docker run -d \
  --name  migu_video \
  --restart=always \
  -p 1234:1234 \
  ghcr.nju.edu.cn/hy5528/migu-video66:latest

```






