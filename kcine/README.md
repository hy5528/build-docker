
# KCine
- 基于 KVideo 4.9.18 版本二次开发的 KCine 视频聚合平台，在继承原版核心能力的基础上进行了深度重构与优化。
- http://你的IP:3051
```text
services:
  kcine:
    container_name: kcine
    image: ghcr.nju.edu.cn/hy5528/kcine66:latest
    restart: always
    ports:
      - 3051:3000
    environment:
      - NODE_ENV=production

```
