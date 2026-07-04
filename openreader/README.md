# OpenReader
- 轻量级、自部署、多端同步的小说阅读器。
- http://你的IP:8680
```text
services:
  openreader:
    image: ghcr.io/hy5528/openreader66:latest
    container_name: openreader
    ports:
      - "8680:8080"
    environment:
      OPENREADER_JWT_SECRET: 123456
      OPENREADER_LOCAL_STORE_DIR: /app/library/localStore
    volumes:
      - ./data:/app/data
      - ./cache:/app/cache
      - ./library:/app/library
    restart: unless-stopped

```
