#!/usr/bin/dumb-init /bin/sh

env

set -x

mopidy --config /config/mopidy/mopidy.conf
