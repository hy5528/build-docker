# alpine-mpd

```text
sudo docker run -d \
    --name mpd \
    --device /dev/snd \
    -p 6600:6600 \
    -p 8000:8000 \
    -v /mnt/music:/music \
    -v /mnt/playlists:/var/lib/mpd/playlists \
    ghcr.nju.edu.cn/hy5528/mpd66:latest

```

