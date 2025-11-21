# mopidy-docker

Run Mopidy in Docker


## Examples

A simple docker-compose.yaml file.  


```text
---
version: "3.3"

services:
  mopidy:
    image: giof71/mopidy
    container_name: mopidy
    user: "1000:29"
    devices:
      - /dev/snd:/dev/snd
    environment:
      - AUDIO_OUTPUT=alsasink device=hw:D10
      - RESTORE_STATE=yes
      - SCROBBLER_ENABLED=${SCROBBLER_ENABLED:-}
      - SCROBBLER_USERNAME=${SCROBBLER_USERNAME:-}
      - SCROBBLER_PASSWORD=${SCROBBLER_PASSWORD:-}
      - TIDAL_ENABLED=yes
      - TIDAL_QUALITY=${TIDAL_QUALITY:-LOSSLESS}
    ports:
      - 6680:6680
      - 8989:8989
    volumes:
      - ./config:/config
      - ./cache:/cache
      - ./data:/data
    restart: always
```

In order to correctly set the credentials for Tidal, the first run should be done with this command:

`docker-compose run mopidy`

Look at the displayed instructions. The log should present a line similar to the following:

```text
mopidy-app | INFO     2024-11-17 11:37:31,306 [39:TidalBackend-7 (_actor_loop)] mopidy_tidal.backend
mopidy-app |   Please visit 'http://localhost:8989' or 'https://link.tidal.com/XXXXX' to authenticate
```

follow the second link, authenticate with Tidal (if necessary) and authorize the new device on Tidal.  
If, for any reason, you want to use the `PKCE` authentication, use the first link and follow the instructions that will be presented.  

You will need an active Tidal subscription, of course.  
After this action, you can stop the container (CTRL-C), and then start it normally using:

`docker-compose up -d`

The application should be accessible at the host-ip at port 6680.  


