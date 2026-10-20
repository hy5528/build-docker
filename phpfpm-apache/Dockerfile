FROM shinsenter/phpfpm-apache:latest-alpine
# 1. 安装 Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
EXPOSE 80
