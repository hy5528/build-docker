# solara
- 由轻量后端服务支撑的现代化网页音乐播放器，整合多种音乐聚合接口，覆盖搜索、播放与音频下载全流程。
- http://你的IP:3001

```text

services:
  solara:
    image: ghcr.io/hy5528/solara66:latest
    container_name: solara-music
    restart: always
    ports:
      - "3001:3000"
    volumes:
      - ./data:/app/data
      - /www/downloads:/app/downloads # 改成你想要下载到nas的目录
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DB_PATH=/app/data/solara.db
      - NAS_DOWNLOAD_DIR=/app/downloads
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"    
   

```
