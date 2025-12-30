# 基于以下开源项目

- [maccms10](https://github.com/magicblack/maccms10)
- [maccms_down](https://github.com/magicblack/maccms_down)

# 编译镜像

```sh
docker build -t hvlive/maccms:latest .
```

# 部署镜像

> 该项目需要用到 MySQL 数据库，请先自行部署 MySQL 数据库（8.4.0版本测试可用，其他版本自行测试）

```
docker run -d --restart=unless-stopped --name maccms -p {host_port}:80 -v {host_data_path}:/var/www/html hvlive/maccms:latest
```

# 访问地址

- 用户前端: `http://{host}:{host_port}`

  > 内置了 Conch 模板，所以支持桌面端和移动端布局（需要先在管理后台切换模板）

- 管理后台：`http://{host}:{host_port}/maccmsadmin.php/admin/index/index.html`
  > 原地址 admin.php 因为安全问题已经修改为 maccmsadmin.php

- Conch 模板后台：`http://{host}:{host_port}/maccmsadmin.php/admin/conch/theme`
  > 需要先访问一次 `用户前端`，不然会出现找不到控制器的错误
