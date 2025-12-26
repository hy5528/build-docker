ARG ALPINE_VERSION=3.22
FROM alpine:$ALPINE_VERSION AS builder

ARG MPD_VERSION=0.24.6

WORKDIR /

RUN apk update \
  && apk add \
      alpine-sdk \
      boost-dev \
      autoconf \
      automake \
      libtool \
      gnupg \
      meson \
      libmpdclient-dev \
      libvorbis-dev \
      libsamplerate-dev \
      libid3tag-dev \
      mpg123-dev \
      flac-dev \
      ffmpeg-dev \
      alsa-lib-dev \
      sqlite-dev \
      libmad-dev \
      lame-dev \
      libsndfile-dev \
      faac-dev \
      faad2-dev \
      soxr-dev \
      libcdio-dev \
      bzip2-dev \
      curl-dev \
      wavpack-dev \
      sndio-dev \
      libmodplug-dev \
      yajl-dev \
      libshout-dev \
      pcre-dev \
      zziplib-dev \
      libgcrypt-dev \
      libmms-dev \
      icu-dev \
      libnfs-dev \
      expat-dev \
      fmt-dev \
      liburing-dev \
      pcre2-dev \
      xz \
      wget

RUN echo \
# MPD \
  && wget -nv https://www.musicpd.org/download/mpd/${MPD_VERSION%.*}/mpd-${MPD_VERSION}.tar.xz \
  && tar xJvf /mpd-${MPD_VERSION}.tar.xz -C / \
  && export DESTDIR=/build \
  && cd mpd-${MPD_VERSION} \
  && bash -c '[ -f autogen.sh ] && ./autogen.sh || true' \
  && bash -c '[ -f configure ] && ./configure --enable-dsd --prefix=/usr --sysconfdir=/etc --localstatedir=/var --runstatedir=/run && make DESTDIR=/build install || true' \
  && bash -c '[ -f meson.build ] && meson --prefix=/usr --sysconfdir=/etc --localstatedir=/var build && cd build && ninja && ninja install && strip -g /build/usr/bin/mpd || true' \
  && cd / \
# \
# CLEANUP \
  && rm -rvf /build/usr/share/man/* /build/usr/lib/pkgconfig /build/usr/lib/cmake /build/usr/share/aclocal /build/usr/include \
  && find /build/usr/bin -type f -executable -exec strip -g {} \;

ARG ALPINE_VERSION
FROM alpine:$ALPINE_VERSION AS runner


COPY --from=builder /build/ /

RUN adduser -D -g '' mpd

RUN apk -q update \
    && apk -q --no-progress add \
      bats \
      libmpdclient \
      flac \
      yajl \
      libsndfile \
      libsamplerate \
      libvorbis \
      faad2-libs \
      sndio-libs \
      libshout \
      mpg123-libs \
      libid3tag \
      libcurl \
      libmad \
      ffmpeg-libs \
      soxr \
      lame \
      wavpack \
      pcre \
      sqlite-libs \
      libmodplug \
      zziplib \
      libgcrypt \
      libmms \
      icu-libs \
      libnfs \
      libcdio \
      mpc \
      alsa-utils \
      expat \
      ncurses \
      fmt \
      liburing \
      pcre2 \
    && rm -rf /var/cache/apk/* \
    && mkdir -p /var/lib/mpd/data \
    && touch /var/lib/mpd/data/database \
        /var/lib/mpd/data/state \
        /var/lib/mpd/data/sticker.sql \
    && chown -R mpd:audio /var/lib/mpd

VOLUME "/var/lib/mpd"

COPY mpd.conf /etc/mpd.conf

# 6600 mpd port, 8000 mpd http output
EXPOSE 6600 8000

CMD ["/usr/bin/mpd", "--no-daemon", "--stdout", "/etc/mpd.conf"]

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=5s \
  CMD mpc status || exit 1
