# online-video
- 一个面向桌面与手机浏览器的响应式影视网站。项目使用 MacCMS API 获取影视列表、详情和播放地址，并以公开网页的热播信息作为首页排序参考。
- 启动后访问 http://服务器IP:3350。


docker-compose.yml
```text
docker run -d \
  --name online-video \
  --restart=always \
  -p 3350:3000 \
  ghcr.nju.edu.cn/hy5528/online-video66:latest
```
