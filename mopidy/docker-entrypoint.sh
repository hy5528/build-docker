#!/usr/bin/env sh
set -Eeuo pipefail

set_env_var () {
    local var="$1"
    local value="${2:-}"

    # check if the environment variable 'var' is set
    if [ -n "$(eval echo "\$$var" 2>/dev/null)" ]; then
        value="$(eval echo "\$$var")"
    fi

    export "$var"="$value"
}

install_mopidy_addons() {
    if [ -n "$MOPIDY_ADDONS" ]; then
        python3 -m pip install --no-cache-dir $MOPIDY_ADDONS
    fi
}

create_mopidy_user() {
    adduser -u "$USER_ID" -D mopidy
    export HOME=/home/mopidy
    chown mopidy "$HOME"
    chown -R mopidy "$HOME/.config/mopidy"
}

main() {
    # set_env_var "USER_ID" "9001"
    set_env_var "MOPIDY_ADDONS"

    install_mopidy_addons
    # create_mopidy_user

    # exec su-exec mopidy "$@"
    exec "$@"
}

main "$@"
