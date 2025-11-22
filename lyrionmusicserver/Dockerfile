#Base image
FROM alpine:3.22.2

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV LC_ALL="C.UTF-8" LANG="en_US.UTF-8" LANGUAGE="en_US.UTF-8"
ENV PUID=499 PGID=100
ENV HTTP_PORT=9000

# Install packages
RUN apt-get update -qq  && \
	apt-get install --no-install-recommends -qy wget curl perl tzdata libcrypt-blowfish-perl libwww-perl libfont-freetype-perl liblinux-inotify2-perl \
	libdata-dump-perl libio-socket-ssl-perl libnet-ssleay-perl libcrypt-ssleay-perl libcrypt-openssl-rsa-perl libssl-dev libgomp1 libasound2 lame && \
	apt-get clean -qy && \
	rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Add & configure user
RUN adduser --system --group -uid=$PUID yann && \
	usermod -g $PGID yann && \
	usermod -d /home yann && \
	usermod -a -G audio yann && \
	usermod -a -G users yann

# Add startup script
COPY start-container.sh /usr/bin/start-container
RUN chmod +x /usr/bin/start-container

# Volume and port setup
RUN mkdir -p /config /music /playlist /lms
RUN chown -R yann:users /config /playlist

# Installation de Lyrion Music Server
# RUN wget https://downloads.lms-community.org/LyrionMusicServer_v9.0.2/lyrionmusicserver-9.0.2.tgz && \
RUN wget https://downloads.lms-community.org/LyrionMusicServer_v9.0.3/lyrionmusicserver-9.0.3-arm-linux.tgz && \
    tar -xvzf lyrionmusicserver-9.0.3-arm-linux.tgz && \
    rm lyrionmusicserver-9.0.3-arm-linux.tgz && \
    mv ./lyrionmusicserver-9.0.3-arm-linux/* /lms && \
    rm -rf lyrionmusicserver-9.0.3-arm-linux

# COPY . /lms
# COPY Slim-Utils-OS-Custom.pm /lms/Slim/Utils/OS/Custom.pm

RUN chmod -R a+rX /lms

VOLUME /config /music /playlist

EXPOSE 3483 3483/udp ${HTTP_PORT} 9090

#Startup setup
WORKDIR /config

ENTRYPOINT ["start-container"]
