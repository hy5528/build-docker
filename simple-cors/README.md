# simple-cors-proxy
- simple-cors-proxy 是一款专为聚合视频源、电视直播及网盘媒体打造的独立应用。
- 使用 http://服务器IP:8380/proxy 加上你访问的地址。如 http://服务器IP:8380/proxy/https://cj.lziapi.com/api.php/provide/vod

```text
docker run -d --name simple-cors-proxy  -p 8380:8080 ghcr.io/hy5528/simple-cors66:latest
```
