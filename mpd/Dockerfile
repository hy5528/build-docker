# docker_mpd
FROM alpine:3

ARG VERSION


COPY docker-compose.yml env start.sh mpd.conf /
RUN apk --no-cache add mpd ympd sqlite-libs \
	&& chmod u+x /start.sh \
	&& mkdir /mpd
EXPOSE 6600 8000 64801
CMD ["/start.sh"]
