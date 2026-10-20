FROM shinsenter/phpfpm-apache:latest-alpine

# 1. 安装 Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# 2. 安装系统依赖及 PHP 扩展
# 注意：apache-alpine 镜像已经包含 Apache，不需要安装 nginx
RUN apk add --no-cache \
    zip \
    unzip \
    git \
    curl \
    bash \
    libzip \
    libpng \
    libjpeg-turbo \
    freetype \
    # 编译时依赖
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    $PHPIZE_DEPS \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo_mysql gd opcache bcmath pcntl zip \
    # 清理编译依赖
    && apk del --no-network $PHPIZE_DEPS libzip-dev libpng-dev libjpeg-turbo-dev freetype-dev \
    && rm -rf /var/cache/apk/* /tmp/* /usr/share/man /usr/local/lib/php/doc

# 3. 设置工作目录 (Apache 默认文档根目录通常是 /var/www/html)
WORKDIR /var/www/html

# 4. 暴露 Apache 默认端口
EXPOSE 80

