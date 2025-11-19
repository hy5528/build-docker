FROM alpine:latest
ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python

RUN pip install --no-cache \
    mopidy \
    Mopidy-Iris \
    Mopidy-Local \
    Mopidy-Mobile \
    Mopidy-MPD

EXPOSE 6600 6680

ENTRYPOINT ["mopidy"]
