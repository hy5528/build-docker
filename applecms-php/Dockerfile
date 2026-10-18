FROM php:8.4-fpm-alpine

# 安装 Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# 安装系统依赖和 PHP 扩展
# 注意：同时安装 -dev (编译用) 和基础包 (运行用)
RUN apk add --no-cache \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    mysql-client \
    zip \
    unzip \
    git \
    bash \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo_mysql gd opcache pcntl zip \
    # 编译完成后删除 -dev 包以减小镜像体积，保留运行时库
    && apk del libzip-dev libpng-dev libjpeg-turbo-dev freetype-dev \
    && rm -rf /var/cache/apk/*

WORKDIR /var/www/html

# PHP-FPM 默认监听 9000 端口
EXPOSE 9000
