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

You will need an active Tidal subscription, of course.  
After this action, you can stop the container (CTRL-C), and then start it normally using:

`docker-compose up -d`

The application should be accessible at the host-ip at port 6680.  


