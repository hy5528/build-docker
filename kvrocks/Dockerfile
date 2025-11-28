FROM FROM alpine:3.22.2



RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
 && apk update \
 && apk add --no-cache git build-essential autoconf cmake libtool python3 libssl-dev clang \
 && rm -rf /var/cache/apk/*


WORKDIR /kvrocks

COPY . .
RUN ./x.py build --compiler=clang -DENABLE_OPENSSL=ON -DPORTABLE=1 -DCMAKE_BUILD_TYPE=Release -j $(nproc) $MORE_BUILD_ARGS

FROM FROM alpine:3.22.2

RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
 && apk update \
 && apk add --no-cache openssl ca-certificates redis-tools binutils \
 && rm -rf /var/cache/apk/*

# Create a dedicated non-root user and group
RUN groupadd --gid=999 -r kvrocks && useradd --uid=999 -r -g kvrocks kvrocks

RUN mkdir /var/run/kvrocks /var/lib/kvrocks && \
    chown -R kvrocks:kvrocks /var/run/kvrocks /var/lib/kvrocks

# Switch to the non-root user
USER 999

VOLUME /var/lib/kvrocks

COPY --from=build /kvrocks/build/kvrocks /bin/

HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD redis-cli -p 6666 PING | grep -E '(PONG|NOAUTH)' || exit 1

COPY ./LICENSE ./NOTICE ./licenses /kvrocks/
COPY ./kvrocks.conf /var/lib/kvrocks/

ENV MALLOC_CONF="prof:true,prof_active:false,background_thread:true"

EXPOSE 6666:6666

ENTRYPOINT ["kvrocks", "-c", "/var/lib/kvrocks/kvrocks.conf", "--dir", "/var/lib/kvrocks", "--pidfile", "/var/run/kvrocks/kvrocks.pid", "--bind", "0.0.0.0"]
