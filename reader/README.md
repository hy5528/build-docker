# reader
http://你的IP:4396

单用户
```text
docker run -d --name=reader --restart=always -v /www/reader/storage:/storage -v /www/reader/logs:/logs -p 4396:8080 ghcr.nju.edu.cn/hy5528/reader66:latest

```

