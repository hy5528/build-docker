# 使用指定的基础镜像
FROM yobasystems/alpine:3.23.5-armhf

# 1. 安装依赖并创建用户/组
# 将 apk add 和用户创建放在前面，确保环境准备就绪
RUN apk update && \
    apk upgrade && \
    apk add --no-cache mariadb mariadb-client mariadb-server-utils tzdata bash && \
    # 创建 mysql 组和用户
    groupadd -g 1000 mysql && \
    useradd -u 1000 -d /var/lib/mysql -g mysql -s /bin/bash -m mysql && \
    # 创建必要的目录并设置权限
    mkdir -p /var/lib/mysql /var/lib/backup /etc/mysql/conf.d /etc/mysql/init.d && \
    # 清理缓存
    rm -rf /var/cache/apk/*

# 2. 复制自定义配置和脚本
# 在声明 VOLUME 之前复制文件，确保它们被包含在镜像层中
COPY ./overlay /

# 3. 修复脚本格式和权限
# 注意：确保 /etc/container.d 和 /etc/entrypoint.d 存在，否则 find 会报错
RUN if [ -d /etc/container.d ]; then find /etc/container.d -type f -name "*.sh" -exec sed -i 's/\r$//' {} +; fi && \
    if [ -d /etc/entrypoint.d ]; then find /etc/entrypoint.d -type f -name "*.sh" -exec sed -i 's/\r$//' {} +; fi && \
    sed -i 's/\r$//' /usr/bin/backup /usr/bin/healthcheck /usr/bin/container 2>/dev/null || true && \
    chmod +x /usr/bin/backup /usr/bin/healthcheck /usr/bin/container && \
    if [ -d /etc/container.d ]; then chmod +x /etc/container.d/*.sh; fi && \
    if [ -d /etc/entrypoint.d ]; then chmod +x /etc/entrypoint.d/*.sh; fi && \
    # 设置 mysql 数据目录所有权
    chown -R mysql:mysql /var/lib/mysql /var/lib/backup /etc/mysql

# 4. 声明卷
# 在初始化和权限设置完成后声明 VOLUME
VOLUME ["/var/lib/mysql", "/var/lib/backup", "/etc/mysql/conf.d", "/etc/mysql/init.d"]

# 5. 暴露端口
EXPOSE 3306

# 6. 设置工作目录
WORKDIR /var/lib/mysql

# 7. 设置启动命令
CMD ["/usr/bin/container"]
