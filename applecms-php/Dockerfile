FROM php:8.4-alpine
# 1. 安装 Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# 2. 安装系统依赖、PHP 扩展及 GD 所需库
# 关键点：必须安装 libpng, libjpeg-turbo, freetype (运行时库)
# 以及它们的 -dev 版本 (编译时库)
RUN apk add --no-cache \
    nginx \
    zip \
    unzip \
    git \
    curl \
    bash \
    libzip \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libpng \
    libjpeg-turbo \
    freetype \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo_mysql gd opcache bcmath pcntl zip \
    # 3. 清理编译依赖以减小镜像体积，但保留运行时库
    && apk del libzip-dev libpng-dev libjpeg-turbo-dev freetype-dev libzip-dev \
    && rm -rf /var/cache/apk/*

WORKDIR /var/www/html
COPY . /var/www/html/
EXPOSE 8010
CMD ["sh","/var/www/html/docker/php/start.sh"]
