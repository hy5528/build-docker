FROM xcq0607/lxserver:latest



EXPOSE 9527
ENV NODE_ENV='production'
ENV PORT=9527
ENV BIND_IP='0.0.0.0'
# ENV PROXY_HEADER 'x-real-ip'
# ENV SERVER_NAME 'My Sync Server'
# ENV MAX_SNAPSHOT_NUM '10'
# ENV LIST_ADD_MUSIC_LOCATION_TYPE 'top'
# ENV LX_USER_user1 '123.123'
# ENV LX_USER_user2 '{ "password": "123.456", "maxSnapshotNum": 10, "list.addMusicLocationType": "top" }'
# ENV CONFIG_PATH '/server/data/config.js'
# ENV WEBDAV_URL ''
# ENV WEBDAV_USERNAME ''
# ENV WEBDAV_PASSWORD ''
# ENV SYNC_INTERVAL '60'
# ENV ENABLE_WEBPLAYER_AUTH 'false'
# ENV WEBPLAYER_PASSWORD '123456'
# ENV LOG_PATH '/server/logs'
# ENV DATA_PATH '/server/data'
# ENV PLAYER_ENABLE_AUTH 'true'
# ENV PLAYER_PASSWORD '123.456'

CMD [ "node", "index.js" ]
