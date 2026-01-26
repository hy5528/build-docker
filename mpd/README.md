
#### Debug / Custom Config

Get config from image:

```docker
docker run --rm jsiu/docker_mpd cat /mpd.conf > mpd.conf
```

Change mpd.conf log_level to verbose:

```conf
log_level  "verbose"
```

Run with mpd.conf mapping:

```docker
docker run \
-e PUID=1001 \
-e PGID=1002 \
-p 6600:6600/tcp \
-v /home/jsiu/mpd.conf:/mpd.conf \ # Map mpd.conf into container
-v /home/jsiu/MPD:/mpd/.mpd \
-v /home/jsiu/Music:/mpd/music \
--device /dev/snd \
jsiu/docker_mpd
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


