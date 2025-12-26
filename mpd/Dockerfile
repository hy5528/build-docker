FROM alpine:latest

# Install MPD and required dependencies
RUN apk add --no-cache mpd ympd lame flac vorbis-tools faac ffmpeg alsa-utils alsa-lib curl

# Create required directories with proper permissions
RUN mkdir -p \
    /var/lib/mpd/music \
    /var/lib/mpd/playlists \
    /var/log/mpd \
    /run/mpd && \
    chown -R mpd:audio /var/lib/mpd /var/log/mpd /run/mpd

# Copy MPD configuration
COPY ./mpd.conf /etc/mpd.conf
RUN chown mpd:audio /etc/mpd.conf

# Switch to MPD user
USER mpd

# Expose MPD port and HTTP streaming port
EXPOSE 6600 8000 64801

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD nc -z -i 1 -w 1 localhost ${MPD_PORT:-6600} \
        && wget --quiet --tries=1 --no-check-certificate --spider http://localhost:${MPD_WEB_PORT:-64801} \
        || exit 1

# Set working directory
WORKDIR /var/lib/mpd

# Start MPD
ENTRYPOINT ["mpd", "--no-daemon"]
CMD ["--stdout", "--stderr"]
