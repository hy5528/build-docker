# MPD - Music Player Daemon (Docker Image)

### What is MPD?
Music Player Daemon (MPD) is a free and open music player server. It plays audio
files, organizes playlists and maintains a music database. In order to interact
with it, a client program is needed. The MPD distribution includes mpc, a simple
command line client.
> [wikipedia.org/wiki/Music_Player_Daemon](https://en.wikipedia.org/wiki/Music_Player_Daemon) 

### How to use this image
```sh
docker run --name mpd \
-p 6600:6600 -p 8000:8000 \
--device=/dev/snd:/dev/snd \
--cap-add=sys_nice \
-v $(pwd)/music:/mpd/music:rw \
-v $(pwd)/playlists:/mpd/playlists:rw \
-v $(pwd)/data:/mpd/data:rw \
-d ghcr.io/tomswartz07/mpd-docker:latest
```

http://localhost:8000 for Stream | Host: Host/IP , Port: 6600 for MPD Client.

**Clients**:  
List of MPD Clients you can find here: https://www.musicpd.org/clients/  

A configuration file for NCMPCPP has been provided.

A sample Docker Compose has been added.


## Extras and Related Projects:

If you'd like to Scrobble your listens, you can use the partner-project
[mpdscribble-docker](https://github.com/tomswartz07/mpdscribble-docker) to create
a container image which will submit the tracks and information to a variety of
cloud and local based services, including [Maloja](https://github.com/krateng/maloja).
