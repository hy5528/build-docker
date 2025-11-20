Dockerfile <https://github.com/vgist/dockerfiles/tree/master/mpd>

Automatically built by Github Actions

#### Volume

- /music
- /var/lib/mpd/playlists

#### Custom usage:

    docker run \
        -d \
        --name mpd \
        --device /dev/snd \
        -p 6600:6600 \
        -p 8000:8000 \
        -v /your/music:/music \
        -v /your/playlists:/var/lib/mpd/playlists \
        gists/mpd

#### Compose example:

    #### Custom usage:

services:
  mopidy:
    image: ghcr.nju.edu.cn/hy5528/mopidy66:latest
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
      - /media/music:/root/music
    restart: always

#### 


