# docker_mpd
FROM alpine:3.23.2

COPY docker-compose.yml env start.sh mpd.conf /
RUN apk --no-cache add mpd sqlite-libs \
	&& chmod u+x /start.sh \
	&& mkdir /mpd

CMD ["/start.sh"]
