自用镜像,测试用。
---
# mopidy-docker

Run Mopidy in Docker

Mopidy plugins：
Mopidy-Local
Mopidy-Iris
Mopidy-Mpd
Mopidy-Muse
Mopidy-MusicBox-Webclient
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


Look at the displayed instructions. The log should present a line similar to the following:

```text

You will need an active Tidal subscription, of course.  
After this action, you can stop the container (CTRL-C), and then start it normally using:

`docker-compose up -d`

The application should be accessible at the host-ip at port 6680.  



---
splayer
---
docker run -d --name SPlayer --restart=always -p 25884:25884 ghcr.nju.edu.cn/hy5528/splayer66:latest

---
yesplaymusic
---
docker run -d --name yesplaymusic --restart=always -p 5300:80 ghcr.nju.edu.cn/hy5528/yesplaymusic66:latest

music-player
---
docker run -d --name music --restart=always -v /home/docker/music/cache:/var/www/html/cache -v /home/docker/music/temp:/var/www/html/temp -p 268:80 ghcr.nju.edu.cn/hy5528/music-player66:latest

