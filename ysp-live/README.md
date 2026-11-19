# ysp-live
- IPTV稳定高清快速
- http://IP:8767/all.m3u
```text
services:
  ysp-live:
    image: ghcr.nju.edu.cn/hy5528/ysp-live66:latest
    container_name: ysp-live
    restart: unless-stopped
    network_mode: host
    dns:
      - 223.5.5.5
      - 119.29.29.29
      - 1.1.1.1
    volumes:
      - ./data:/app/data
    environment:
      - TZ=Asia/Shanghai
      - PYTHONUNBUFFERED=1
      - YSP_DATA_DIR=/app/data
      - NODE_OPTIONS=--max-old-space-size=256 --optimize-for-size
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```
