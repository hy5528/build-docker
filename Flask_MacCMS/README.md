# cmsmovie
实现了maccms10的视频功能

前台: http://localhost:5000/
后台: http://localhost:5000/admin/login

管理员账户

默认账户配置在 config.py 中:
用户名: admin
密码: 123456
```text
docker run -d \
  --name cmsmovie \
  -p 5000:5000 \
  --restart=always \
  -v /opt/maccms/instance:/app/instance \
  -v /opt/maccms/backups:/app/backups \
  -v /opt/maccms/app/static/uploads:/app/app/static/uploads \
  -v /opt/maccms/logs:/app/logs \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=123456 \
  ghcr.io/hy5528/flask_maccms66:latest

```
