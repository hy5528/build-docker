自用镜像,测试用。
---
# mopidy-docker

Run Mopidy in Docker

Mopidy plugins：
Mopidy-Local
Mopidy-Iris
Mopidy-Mpd
Mopidy-Muse
Mopidy-Soundcloud

## Examples

A simple docker-compose.yaml file.  


```text

services:
  mopidy:
    image: hy5528/mopidy:latest
    container_name: mopidy
    devices:
      - /dev/snd:/dev/snd
    ports:
      - 6680:6680
      - 6600:6600
    volumes:
      - /run/udev:/run/udev:ro
      - /opt/config:/root/.config
      - /opt/local:/root/.local
      - /media/music:/music
    restart: always
```

# lunatv
```text

services:
  moontv-core:
    image: ghcr.nju.edu.cn/hy5528/lunatv66:latest
    container_name: moontv-core
    restart: on-failure
    ports:
      - '3000:3000'
    environment:
      - USERNAME=admin
      - PASSWORD=your_secure_password
      - NEXT_PUBLIC_STORAGE_TYPE=kvrocks
      - KVROCKS_URL=redis://moontv-kvrocks:6666
    networks:
      - moontv-network
    depends_on:
      - moontv-kvrocks

  moontv-kvrocks:
    image: apache/kvrocks
    container_name: moontv-kvrocks
    restart: unless-stopped
    volumes:
      - kvrocks-data:/var/lib/kvrocks
    networks:
      - moontv-network

networks:
  moontv-network:
    driver: bridge

volumes:
  kvrocks-data:

```

# splayer
```text


docker run -d --name SPlayer --restart=always -p 25884:25884 ghcr.nju.edu.cn/hy5528/splayer66:latest

```

# yesplaymusic
```text

docker run -d --name yesplaymusic --restart=always -p 5300:80 ghcr.nju.edu.cn/hy5528/yesplaymusic66:latest

```

# music-player
```text

docker run -d --name music --restart=always -v /home/docker/music/cache:/var/www/html/cache -v /home/docker/music/temp:/var/www/html/temp -p 268:80 ghcr.nju.edu.cn/hy5528/music-player66:latest

```
