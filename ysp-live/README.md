# ysp-live
- IPTV稳定高清快速
- http://IP:8767/all.m3u
```text
services:
  hd-iptv:
    image: ghcr.nju.edu.cn/hy5528/kvideo66:latest
    container_name: ysp-live
    restart: unless-stopped
    ports:
      - "${HOST_PORT:-9797}:9797"
    volumes:
      - /opt/ysp-live/data:/app/data
    environment:
      TZ: ${TZ:-Asia/Shanghai}
  

```
