# maccms-parser
- 一個通用的 MacCMS 解析 / 播放網頁工具
- http://你的IP:5900
```text
services:
  maccms_parser:
    image: ghcr.nju.edu.cn/hy5528/maccms-parser66:latest
    container_name: maccms_parser
    ports:
      - "5900:5000"
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    # 資源限制 - 針對小型雲端伺服器 (0.5 CPU + 512MB RAM)
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 450M
        reservations:
          cpus: '0.25'
          memory: 200M
    healthcheck:
      test: [ "CMD", "curl", "-f", "http://localhost:5900/api/health" ]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    # 環境變量
    environment:
      - PYTHONUNBUFFERED=1
      - MAX_CONCURRENT_REQUESTS=10
      - TZ=Asia/Taipei
```
