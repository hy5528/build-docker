# SolarPanel V3
- SolarPanel V3 - 轻量自托管导航页面板
- 启动后访问 http://服务器IP:10086 

```text
services:
  solarpanel:
    image: ghcr.nju.edu.cn/hy5528/solarpanel66:latest
    container_name: solarpanel-v3
    restart: unless-stopped
    ports:
      - "10086:10086"
    volumes:
      - ./data:/app/data
      - /:/host:ro                                   # NAS 监控：宿主 /proc、/sys、存储池
      - /var/run/docker.sock:/var/run/docker.sock     # NAS 监控：容器列表
    environment:
      - TZ=Asia/Shanghai
      - SERVER_PORT=10086
      - NAS_HOST_ROOT=/host
      - DOCKER_SOCKET=/var/run/docker.sock
```
