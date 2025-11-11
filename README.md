
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
