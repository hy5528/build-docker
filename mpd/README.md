
#### Debug / Custom Config

Get config from image:



Run with mpd.conf mapping:

```docker
docker run \
-e PUID=1001 \
-e PGID=1002 \
-p 6600:6600/tcp \
-v /home/mpd/mpd.conf:/mpd.conf \ # Map mpd.conf into container
-v /home/mpd/MPD:/mpd/.mpd \
-v /mnt:/mpd/music \
--device /dev/snd \
ghcr.io/hy5528/mpd66:latest
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


