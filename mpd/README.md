
#### Debug / Custom Config

Get config from image:



Run with mpd.conf mapping:

```docker
docker run \
    -d \
    --name mpd \
    --device /dev/snd \
    -p 6900:6600 \
    -p 8000:8000 \
    -v /home/mpd/mpd.conf:/mpd.conf\
    -v /home/mpd/MPD:/mpd/.mpd \
    -v /mnt:/mpd/music \
    ghcr.nju.edu.cn/hy5528/mpd66:latest
```

#### Compose

Get docker-compose template from image:

```docker
docker run --rm jsiu/mpd cat /docker-compose.yml > docker-compose.yml
docker run --rm jsiu/mpd cat /env > .env
```

Fill in `.env` according to your environment.

```sh
docker-compose up
```


