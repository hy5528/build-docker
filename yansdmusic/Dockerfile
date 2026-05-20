# 生产阶段 - 使用 Nginx
FROM nginx:alpine

# 安装 wget 用于健康检查
RUN apk add --no-cache wget

# 设置时区
ENV TZ=Asia/Shanghai

# 移除默认的 nginx 配置
RUN rm /etc/nginx/conf.d/default.conf

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/

# 从构建好的文件复制到 nginx 目录
COPY dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
