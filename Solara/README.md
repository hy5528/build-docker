# solara
- 由轻量后端服务支撑的现代化网页音乐播放器，整合多种音乐聚合接口，覆盖搜索、播放与音频下载全流程。
- http://你的IP:3001

```text

services:
  solara-music:
    image: ghcr.io/hy5528/solara66:latest
    container_name: solara-music
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - SOLARA_PASSWORD=123456
      - SESSION_SECRET=KLmlKDruIBRYjrT5ct7B3xqG25ZF2p59
    volumes:
      - ./logs:/app/logs
   

```
