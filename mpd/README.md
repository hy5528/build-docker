# alpine-mpd

[![gh_commit status][201]][151]
[![gh_stars][202]][152]
[![gh_forks][203]][153]
[![gh_watches][204]][154]
[![gh_issues][216]][166]
[![gh_pr][217]][167]

[![dh_pulls][205]][155]
[![dh_stars][206]][156]
[![dh_size:aarch64][208]][158]
[![dh_size:armhf][210]][160]
[![dh_size:armv7l][209]][159]
[![dh_size:i386][211]][161]
[![dh_size:ppc64le][213]][163]
[![dh_size:riscv64][214]][164]
[![dh_size:s390x][215]][165]
[![dh_size:x86_64][207]][157]
<!--[![dh_size:loong64][212]][162]-->

MultiArch Alpine Linux + S6 + Music Player Daemon + yMPD WebU.

[Docs][112] | [Images][155] | [Sources][151]

Maintained (or sometimes a lack thereof?) by [WOAHBase][110].

[110]: https://woahbase.online/
[112]: https://woahbase.online/images/alpine-mpd/

```text

sudo docker run -d \
    --name mpd \
    --device /dev/snd \
    -p 6600:6600 \
    -p 8000:8000 \
    -p 64801:64801 \                        
    -v /mnt:/music \
    -v /mnt/playlists:/var/lib/mpd/playlists \
    ghcr.nju.edu.cn/hy5528/mpd66:latest

```

