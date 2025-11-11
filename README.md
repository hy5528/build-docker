mopidy:


services:
  mopidy:
    image: hy5528/mopidy:latest
    container_name: mopidy
    ports:
      - 6680:6680
      - 6600:6600
    volumes:
      - /opt/config:/mopidy
      - /opt/cache:/cache
