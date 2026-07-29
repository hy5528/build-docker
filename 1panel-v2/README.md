# docker-1panel-v2
- 通过 DooD (Docker-outside-of-Docker) 方式在 Docker 容器中运行 1Panel V2 开源服务器管理面板。
- http://你的IP:9999
```text
docker run \
--name 1panel \
--network host \
--restart unless-stopped \
-v /var/run/docker.sock:/var/run/docker.sock \
-v /www/1Panel/data:/path/to/your/data \
-e PANEL_BASE_DIR=/www/1Panel/data \
-e PANEL_PORT=9999 \
-e PANEL_ENTRANCE=entrance \
-e PANEL_USERNAME=admin \
-e PANEL_PASSWORD=123456 \
--restart unless-stopped \
ghcr.io/hy5528/1panel-v2:latest

```
