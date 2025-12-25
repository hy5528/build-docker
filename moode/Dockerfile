FROM rust:slim-bullseye AS rust-builder


RUN sudo apt update -y
RUN sudo apt install aptitude
RUN echo 'APT::Default-Release "bullseye";' | sudo tee /etc/apt/apt.conf.d/00default
RUN sudo cat /etc/apt/sources.list.d/sid.list
RUN echo 'deb https://deb.debian.org/debian sid main' > /etc/apt/sources.list.d/sid.list
RUN sudo aptitude -q -y install podman
RUN sudo rm /etc/apt/sources.list.d/sid.list
RUN sudo apt update -y
RUN podman system migrate
RUN podman machine init
RUN podman machine start
RUN podman volume create moode
RUN podman run -ti --systemd=always --name debian-moode --network=host --entrypoint=/usr/bin/qemu-arm-static --security-opt seccomp:unconfined --privileged navikey/raspbian-bullseye -execve -0 /sbin/init /sbin/init

RUN podman generate systemd --new --files -n debian-moode
RUN sudo cp /home/$USER/container-debian-moode.service /etc/systemd/system
RUN systemctl daemon-reload
RUN systemctl start container-debian-moode 
RUN sleep 2
RUN podman exec -ti debian-moode /bin/bash -c "apt-get update -y ; sleep 3 ; apt-get upgrade -y"
RUN podman exec -ti debian-moode /bin/bash -c "apt-get install -y curl sudo libxaw7 ssh libsndfile1 libsndfile1-dev cifs-utils"
RUN podman exec -ti debian-moode /bin/bash -c "apt --fix-broken install -y"
RUN sleep 1

RUN podman exec -ti debian-moode /bin/bash -c "curl -1sLf  'https://dl.cloudsmith.io/public/moodeaudio/m8y/setup.deb.sh' | sudo -E distro=raspbian codename=bullseye arch=armv7hf bash -"
RUN podman exec -ti debian-moode /bin/bash -c "apt-get update -y"
RUN podman exec -ti debian-moode /bin/bash -c "apt-get install udisks nginx triggerhappy samba dnsmasq -y"

RUN podman exec -ti debian-moode /bin/bash -c "apt-get install moode-player -y --fix-missing"

RUN podman exec -ti debian-moode /bin/bash -c "apt --fix-broken install -y"
RUN sleep 1
RUN podman exec -ti debian-moode /bin/bash -c "apt-get install moode-player -y --fix-missing"
RUN sleep 1
RUN podman exec -ti debian-moode /bin/bash -c "apt upgrade -y"
RUN systemctl stop container-debian-moode
RUN systemctl start container-debian-moode
RUN sleep 1
RUN podman exec -ti debian-moode /bin/bash -c "sudo sed -i 's/80 /8008 /g' /etc/nginx/sites-available/moode-http.conf"
RUN podman exec -ti debian-moode /bin/bash -c "systemctl start my-service@* --all"
RUN podman exec -ti debian-moode /bin/bash -c "systemctl restart nginx"







