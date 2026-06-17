# sun-panel
- 网页导航。
- api:http://你的IP:3002
```text
services:
  sun-panel:
    image: 'ghcr.nju.edu.cn/hy5528/sun-panel66:latest'
    container_name: sun-panel
    volumes:
      - /opt/conf:/app/conf
      - /opt/uploads:/app/uploads
      - /opt/database:/app/database
    # - /opt/runtime:/app/runtime
    ports:
      - 3002:3002
    restart: always

```
