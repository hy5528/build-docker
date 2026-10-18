FROM shinsenter/phpfpm-apache


# 1. 安装 Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# 2. 配置阿里云 Debian 12 (Bookworm) 源
# 注意：Debian 12 需要包含 non-free-firmware 以获取某些硬件驱动，虽然 PHP 构建不一定需要，但保持完整源更稳定
RUN echo "deb http://mirrors.aliyun.com/debian/ bookworm main contrib non-free non-free-firmware" > /etc/apt/sources.list \
    && echo "deb http://mirrors.aliyun.com/debian/ bookworm-updates main contrib non-free non-free-firmware" >> /etc/apt/sources.list \
    && echo "deb http://mirrors.aliyun.com/debian-security/ bookworm-security main contrib non-free non-free-firmware" >> /etc/apt/sources.list \
    # 清理旧的 sources.list.d 中可能冲突的配置（可选，视镜像具体情况而定）
    && rm -f /etc/apt/sources.list.d/*.list \
    # 更新并安装依赖
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        libzip-dev \
        libpng-dev \
        libjpeg62-turbo-dev \
        libfreetype6-dev \
        libwebp-dev \
        git \
        unzip \
        bash \
    # 配置并安装 PHP 扩展
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) pdo_mysql gd opcache bcmath pcntl zip \
    # 清理缓存
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html
EXPOSE 80
