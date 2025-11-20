
mopidy



#### Compose example:

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

#### Client

- mpc: <http://www.musicpd.org/clients/mpc/>
- ncmpc: <http://www.musicpd.org/clients/ncmpc/>
- nncmpp: <https://git.janouch.name/p/nncmpp/>
