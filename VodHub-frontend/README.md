-  ` /opt` 目录下建立VodHub目录。下载docker-compose.yml到VodHub目录。
- 在 `/opt/VodHub/` 目录下执行命令 `docker-compose up -d` 
- 启动成功后访问 http://你的IP:3700/setting 进行配置
- 
docker-compose.yml
 ```text
services:
  frontend:
    image: ghcr.nju.edu.cn/hy5528/vodhub-frontend66:latest
    container_name: vod_next
    ports:
      - '3700:80'
    environment:
      - NODE_ENV=production
      - API_BASE_URL=http://backend:8888
    depends_on:
      - backend

  backend:
    image: ghcr.nju.edu.cn/hy5528/vodhub-backend66:latest
    container_name: vod_hub
    ports:
      - '8888:8888'
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
      - CACHE_TTL=60
      - TMDB_ENABLED=${TMDB_ENABLED:-false}
      - TMDB_API_TOKEN=${TMDB_API_TOKEN:-}

    volumes:
      - ./logs:/app/apps/backend/logs
    depends_on:
      - redis

  redis:
    image: redis:alpine
    container_name: vod_redis
    restart: always
    volumes:
      - ./data/redis:/data
    ports:
      - '6379:6379'

```
