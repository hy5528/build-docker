# nginx

http://localhost:3600

```text
docker run -d \
--name nginx-web \
--restart always \
-p 3600:80 \
-v /www/nginx/conf:/etc/nginx/conf.d \
-v /www/nginx/log:/var/log/nginx \
-v /www/nginx/html:/usr/share/nginx/html \
ghcr.nju.edu.cn/hy5528/nginx:alpine

```
