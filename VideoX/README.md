# kvideo
- VideoX 是一款专为聚合视频源、电视直播及网盘媒体打造的独立应用。
- 启动后访问 http://服务器IP:3100。
- 初始状态下无密码，您可以进入 管理面板 -> 安全设置 来配置：
全站访问密码：开启后，游客访问主页也需要身份验证。
管理权限密码：用于锁定管理后台、收藏及播放历史记录
```text
docker run -d \
  --name kvideo \
  --restart=always \
  -p 3050:3000 \
  ghcr.io/hy5528/kvideo66:latest

```
