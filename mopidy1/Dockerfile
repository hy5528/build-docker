FROM python:slim-trixie

ENV DEBIAN_FRONTEND="noninteractive"

RUN  apt-get update && \
     apt-get install -y wget apt-transport-https apt-utils ca-certificates locales && \
     apt-get update && \
     echo "en_US.UTF-8 UTF-8" > /etc/locale.gen && \
     locale-gen en_US.UTF-8 && \
     dpkg-reconfigure locales && \
     /usr/sbin/update-locale LANG=en_US.UTF-8

ENV LC_ALL="en_US.UTF-8"

RUN  apt install -y cmake alsa-utils gstreamer1.0-plugins-base \
     libcairo2-dev libjpeg-dev libgif-dev libgirepository1.0-dev libcairo2-dev \
     python3-gst-1.0 python3-tornado python3-pkg-resources python3-pykka python3-requests python3-pip
RUN  pip install Mopidy Mopidy-Mobile Mopidy-MusicBox-Webclient Mopidy-MPD  Mopidy-Local Mopidy-Iris && \
     apt-get purge -y libcairo2-dev libjpeg-dev libgif-dev python3-pip cmake

RUN  apt-get autoremove -y && \
     apt-get autoclean -y

RUN mkdir -p /mopidy/config && mkdir -p /mopidy/data/playlists && mkdir -p /mopidy/cache && mkdir -p /mopidy/cache && mkdir -p /mopidy/media

EXPOSE 6600 6680

CMD ["mopidy"]
