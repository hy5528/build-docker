FROM shinsenter/php:8.4-fpm-nginx

# 1. 安装 Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# 2. 更新包索引并安装系统依赖
# 注意：Debian/Ubuntu 使用 apt-get
# shinsenter/php 镜像可能已经预装了一些扩展，这里我们尝试安装缺失的依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    libzip-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libwebp-dev \
    git \
    unzip \
    bash \
    # 如果镜像未预装 zip 扩展所需的库，可能需要安装 libzip4 或类似运行时包
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) pdo_mysql gd opcache bcmath pcntl zip \
    # 清理缓存以减小体积
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

# 该镜像通常已暴露 80 端口，此处可保留或移除
EXPOSE 80
