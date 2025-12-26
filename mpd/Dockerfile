# docker_mpd
FROM alpine:edge

COPY env start.sh mpd.conf /
RUN apk --no-cache add mpd sqlite-libs \
	&& chmod u+x /start.sh \
	&& mkdir /mpd

CMD ["/start.sh"]
