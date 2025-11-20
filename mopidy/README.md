
mopidy



#### Compose example:

    mpd:
      image: gists/mpd
      ports:
        - "6600:6600"
        - "8000:8000"
      volumes:
        - /your/music:/music
        - /your/playlists:/var/lib/mpd/playlists \
      devices:
        - /dev/snd
      restart: always

#### Client

- mpc: <http://www.musicpd.org/clients/mpc/>
- ncmpc: <http://www.musicpd.org/clients/ncmpc/>
- nncmpp: <https://git.janouch.name/p/nncmpp/>
