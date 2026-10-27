# NextTV
使用 Next.JS 重构LibreTV。

http://你的IP:5500

```text

services:
  NextTV:
    container_name: NextTV
    image: ghcr.nju.edu.cn/seqcrafter/nexttv:latest # 建议替换为具体版本号
    restart: always
    environment:
      - SESSION_SECRET=9014ac793e43b59f8b10d77bd3c26410
      - PASSWORD=ww123456 # 从 .env 文件读取
    ports:
      - "5500:3000"

```

