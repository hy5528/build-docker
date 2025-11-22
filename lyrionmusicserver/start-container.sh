#!/bin/bash

#Set user and group
umask 0002
PUID=${PUID:-`id -u yann`}
PGID=${PGID:-`id -g users`}

# Set uid of user squeezeboxserver to $PUID
echo Set uid of user yann to $PUID
usermod -o -u "$PUID" yann

# Set id of group squeezeboxserver to $PGID and set gid of user squeezeboxserver to $PGID
echo Set id of group users to $PGID
groupmod -o -g "$PGID" users
echo Set gid of user yann to $PGID
usermod -g $PGID yann

#Add permissions
#chown -R yann:users /config /playlist

if [[ -f /config/custom-init.sh ]]; then
	echo "Running custom initialization script..."
	sh /config/custom-init.sh
fi

echo Starting Lyrion Music Server on port $HTTP_PORT...
if [[ -n "$EXTRA_ARGS" ]]; then
	echo "Using additional arguments: $EXTRA_ARGS"
fi
su yann -s /bin/sh -c '/usr/bin/perl /lms/slimserver.pl --prefsdir /config/prefs --logdir /config/logs --cachedir /config/cache --httpport $HTTP_PORT $EXTRA_ARGS'
