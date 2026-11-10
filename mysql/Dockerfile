FROM alpine:3.20

# 设置环境变量
ENV PATH="/usr/bin:${PATH}" \
    MARIADB_MAJOR="10.11"

# 安装依赖
RUN apk add --no-cache \
    mariadb \
    mariadb-client \
    coreutils \
    && rm -rf /var/cache/apk/*

# 创建目录并设置权限
RUN mkdir -p /var/lib/mysql /run/mysqld \
    && chown -R mysql:mysql /var/lib/mysql /run/mysqld

# 暴露端口
EXPOSE 3306

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD mariadb-admin ping -h localhost --socket=/run/mysqld/mysqld.sock || exit 1

# 切换用户
USER mysql

# 启动命令
# --bind-address=0.0.0.0 允许远程连接 (Docker 网络需要)
# --console 将日志输出到 stdout/stderr
CMD ["mysqld", "--user=mysql", "--bind-address=0.0.0.0", "--console"]

