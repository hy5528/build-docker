FROM songloft/songloft:latest

EXPOSE 58091

# 挂载点说明：
# /app/music - 音乐文件目录，建议挂载: -v /your/music/path:/app/music
# /app/data - 数据目录，建议挂载: -v /your/data/path:/app/data
ENV ADMIN_USERNAME=admin
ENV ADMIN_PASSWORD=admin
ENV IN_DOCKER=true

# PUID / PGID：设置任意一个即以该 uid:gid 非 root 运行主程序（entrypoint 内 su-exec 降权），
# 未设置（默认）时保持 root 运行，与旧版本行为一致
ENV PUID=
ENV PGID=

VOLUME ["/app/music", "/app/data"]

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD []
