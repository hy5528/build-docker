# SolarPanel V3
- SolarPanel V3 - 轻量自托管导航页面板
- 启动后访问 http://服务器IP:10086 

```text
services:
  solarpanel:
    build: .
    image: ghcr.nju.edu.cn/hy5528/solarpanel66:latest
    container_name: solarpanel-v3
    restart: unless-stopped
    ports:
      - "10086:10086"
      # - "18443:18443"  # HTTPS_PORT 非空时启用
    volumes:
      - ./data:/app/data
      # NAS 监控：只读挂载宿主机根目录（读取 /proc、/sys、/etc 与存储池容量）
      # 与 Docker socket（读取容器列表与资源占用）；不使用该功能可注释掉这两行。
      # 注意：Docker Desktop 的 socket 由代理转发，不能追加 :ro，故此处不写只读标记。
      - /:/host:ro
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - TZ=Asia/Shanghai
      - SERVER_PORT=10086
      - NAS_HOST_ROOT=/host
      - DOCKER_SOCKET=/var/run/docker.sock
      # - HTTPS_PORT=18443  # 启用内置自签名 HTTPS
    # 需要「整机网卡」网络口径时改用 host 网络（此时 ports 映射失效，可直接用 10086 访问）：
    # network_mode: host
```
