FROM shinsenter/php:8.4-fpm-nginx

# 1. 安装 Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# 2. 替换软件源为阿里云镜像 (针对 Debian/Ubuntu)
# 注意：shinsenter/php 通常基于 Debian，如果是 Ubuntu 需调整 sed 命令
RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list \
    && sed -i 's/security.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list \
    # 如果 sources.list.d 中有其他源，也建议检查或清理
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        libzip-dev \
        libpng-dev \
        libjpeg-dev \
        libfreetype6-dev \
        libwebp-dev \
        git \
        unzip \
        bash \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) pdo_mysql gd opcache bcmath pcntl zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html
EXPOSE 80
