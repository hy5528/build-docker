# docker_mpd
FROM alpine:edge

COPY docker-compose.yml env start.sh mpd.conf /
RUN apk --no-cache add mpd=0.24.8 sqlite-libs \
	&& chmod u+x /start.sh \
	&& mkdir /mpd

CMD ["/start.sh"]
