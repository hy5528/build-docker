FROM songloft/songloft

EXPOSE 58091

# 挂载点说明：
# /app/music - 音乐文件目录，建议挂载: -v /your/music/path:/app/music
# /app/data - 数据目录，建议挂载: -v /your/data/path:/app/data
ENV ADMIN_USERNAME=admin
ENV ADMIN_PASSWORD=admin
ENV IN_DOCKER=true

VOLUME ["/app/music", "/app/data"]

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD []
