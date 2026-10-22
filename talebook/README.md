# talebook
- 一个简单好用的个人书库

```text
services:

  # main service
  talebook:
    restart: always
    image: ghcr.nju.edu.cn/hy5528/talebook66:latest
    volumes:
      # 持久化配置、用户数据库和书库；可在 .env 中用 TALEBOOK_DATA_DIR 指定已有目录
      - "/opt/talebook/data:/data"
    ports:
      - "8580:80"
      - "8443:443"
    environment:
      # 如果需要上传ssl证书，请将PUID与PGID设置为0（root用户）
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
```
