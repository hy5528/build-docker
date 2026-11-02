# solarpanel
- 轻量自托管导航面板。
- 启动后访问 http://服务器IP:10086。
```text
docker run -d \
  --name solarpanel \
  --restart unless-stopped \
  -p 10086:10086 \
  -v $(pwd)/data:/app/data \
  -v /:/host:ro \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e SERVER_PORT=10086 \
  -e NAS_HOST_ROOT=/host \
  -e DOCKER_SOCKET=/var/run/docker.sock \
  ghcr.nju.edu.cn/hy5528/solarpanel66:latest
```
