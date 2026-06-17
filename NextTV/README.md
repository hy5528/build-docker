# NextTV
使用 Next.JS 重构LibreTV。

http://你的IP:5500

```text

docker run -d --name NextTV --restart=always -p 5500:3000 ghcr.io/hy5528/nexttv66:latest

```
```text
docker run -d \
    --restart=unless-stopped \
    --name="nexttv" \
    -p 5500:3000 \
    -e SESSION_SECRET=123456 \
    -e PASSWORD=173724140a7580fcb3ccf07b4fb12e2a \
    ghcr.nju.edu.cn/hy5528/nexttv66:latest
```
