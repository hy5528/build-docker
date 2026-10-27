# NextTV
使用 Next.JS 重构LibreTV。

http://你的IP:5500

```text

services:
  NextTV:
    container_name: NextTV
    image: ghcr.nju.edu.cn/hy5528/nexttv66:latest
    restart: always
    environment:
      - SESSION_SECRET=9014ac793e43b59f8b10d77bd3c26410
      - PASSWORD=ww123456 
    ports:
      - "5500:3000"

```

