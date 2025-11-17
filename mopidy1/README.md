services:
  mopidy:
    image: ghcr.nju.edu.cn/hy5528/mopidy66:latest
    container_name: mopidy
    user: "1000:29"
    devices:
      - /dev/snd:/dev/snd
    environment:
      - AUDIO_OUTPUT=alsasink device=hw:1,0
    ports:
      - 6680:6680
      - 8989:8989
    volumes:
      - /opt/config:/config
      - /opt/cache:/cache
      - /opt/data:/data
    restart: always
