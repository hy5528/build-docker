# jiexiang-radio 杰翔电台
- 一个能真正播放的在线电台 Web 播放器
- http://你的IP:8081
```text
services:
  jiexiang-radio:
    image: ghcr.nju.edu.cn/hy5528/radio66:latest
    container_name: jiexiang-radio
    restart: unless-stopped
    ports:
      - "8081:8080"
    volumes:
      - ./data:/data
    environment:
      - TZ=Asia/Shanghai
      - UPSTREAM_TIMEOUT=15000

```
