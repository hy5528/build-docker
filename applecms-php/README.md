如何正确挂载/修改配置（推荐做法）
由于许多 Docker 镜像默认不加载 php.ini（显示为 none），直接修改容器内的文件在重启后会丢失。最佳实践是‌从宿主机挂载‌。

准备配置文件‌：
在宿主机上创建一个 php.ini 文件。你可以从容器内复制默认模板出来修改：

bash
# 从容器复制生产环境模板到宿主机当前目录
docker cp <容器ID>:/usr/local/etc/php/php.ini-production ./php.ini
修改配置‌：
编辑宿主机的 php.ini，例如修改执行时间：

ini
max_execution_time = 300
memory_limit = 256M
挂载到容器‌：
在 docker-compose.yml 或 docker run 中挂载该文件：

Docker Compose 示例：‌

yaml
services:
  php:
    image: php:8.2-fpm
    volumes:
      # 将宿主机的 php.ini 挂载到容器内的默认加载路径
      - ./php.ini:/usr/local/etc/php/php.ini
      # 如果是 FPM，可能还需要挂载 pool 配置
      - ./www.conf:/usr/local/etc/php-fpm.d/www.conf
重启容器‌：

bash
docker-compose up -d php
总结排查步骤
总结排查步骤
先执行 docker exec -it <容器> php --ini。
看 Loaded Configuration File 是否为 (none)。
如果是 (none)，说明你需要手动挂载一个 php.ini 文件到 /usr/local/etc/php/php.ini（或其他 Configuration File Path 指示的目录）。
如果是 Web 业务，务必通过 phpinfo() 再次确认 Web SAPI 加载的是同一个文件，因为 FPM 和 CLI 可能配置分离。
