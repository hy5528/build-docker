#!/bin/bash

# 硬编码配置
PANEL_BASE_DIR="/opt"
PANEL_PORT="10086"
PANEL_USERNAME="1panel"
PANEL_PASSWORD="1panel_password"
PANEL_ENTRANCE="entrance"

init_configure() {
    echo "正在安装 1Panel 二进制文件..."
    
    # 1. 复制二进制文件
    cp ./1panel-core /usr/local/bin && chmod +x /usr/local/bin/1panel-core
    cp ./1panel-agent /usr/local/bin && chmod +x /usr/local/bin/1panel-agent
    cp ./1pctl /usr/local/bin && chmod +x /usr/local/bin/1pctl
    
    # 2. 建立软链接
    ln -sf /usr/local/bin/1panel-core /usr/bin/1panel
    ln -sf /usr/local/bin/1panel-core /usr/bin/1panel-core
    ln -sf /usr/local/bin/1panel-agent /usr/bin/1panel-agent
    ln -sf /usr/local/bin/1pctl /usr/bin/1pctl

    # 3. 修改 1pctl 配置
    echo "配置 1pctl 参数..."
    sed -i -e "s#BASE_DIR=.*#BASE_DIR=${PANEL_BASE_DIR}#g" /usr/local/bin/1pctl
    sed -i -e "s#ORIGINAL_PORT=.*#ORIGINAL_PORT=${PANEL_PORT}#g" /usr/local/bin/1pctl
    sed -i -e "s#ORIGINAL_USERNAME=.*#ORIGINAL_USERNAME=${PANEL_USERNAME}#g" /usr/local/bin/1pctl
    sed -i -e "s#ORIGINAL_PASSWORD=.*#ORIGINAL_PASSWORD=${PANEL_PASSWORD}#g" /usr/local/bin/1pctl
    sed -i -e "s#ORIGINAL_ENTRANCE=.*#ORIGINAL_ENTRANCE=${PANEL_ENTRANCE}#g" /usr/local/bin/1pctl
    sed -i -e "s#LANGUAGE=.*#LANGUAGE=en#g" /usr/local/bin/1pctl

    # 4. 部署资源文件 (GeoIP, initscript, lang)
    RUN_BASE_DIR=$PANEL_BASE_DIR/1panel
    mkdir -p "$RUN_BASE_DIR/geo"
    mkdir -p "$RUN_BASE_DIR/resource"
    mkdir -p "$RUN_BASE_DIR/db"
    
    # 复制 GeoIP 数据库
    if [ -f "./GeoIP.mmdb" ]; then
        echo "复制 GeoIP 数据库..."
        cp ./GeoIP.mmdb "$RUN_BASE_DIR/geo/"
    fi
    
    # 复制语言包 (到 /usr/local/bin/lang，这是 1pctl 寻找语言文件的位置)
    if [ -d "./lang" ]; then
        echo "复制语言包..."
        cp -r ./lang /usr/local/bin/
    fi

    # 复制 initscript 到资源目录 (虽然容器不用 systemd，但面板可能需要读取这些模板)
    if [ -d "./initscript" ]; then
        echo "复制 initscript 资源..."
        cp -r ./initscript "$RUN_BASE_DIR/resource/"
    fi
}

main() {
    echo "开始 Docker 构建模式安装 (源码下载版)..."
    init_configure
    echo "1Panel 安装文件部署完成。"
}

main