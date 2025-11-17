自用镜像,测试用。
---
mopidy:
---
services:
  mopidy:
    image: ghcr.nju.edu.cn/hy5528/mopidy66:latest
    container_name: mopidy
    user: "1000:29"
    devices:
      - /dev/snd:/dev/snd
    ports:
      - 6680:6680
      - 6600:6600
    volumes:
      - /opt/config:/root/.config/mopidy
      - ./cache:/root/.cache
      - ./local:/root/.local
      - /media/music:/root/music:ro
    restart: always

---
splayer
---
docker run -d --name SPlayer --restart=always -p 25884:25884 ghcr.io/hy5528/splayer66:latest

---
yesplaymusic
---
docker run -d --name yesplaymusic --restart=always -p 5300:80 ghcr.io/hy5528/yesplaymusic66:latest

music-player
---
docker run -d --name music --restart=always -v /home/docker/music/cache:/var/www/html/cache -v /home/docker/music/temp:/var/www/html/temp -p 268:80 ghcr.io/hy5528/music-player66:latest

