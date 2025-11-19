FROM  debian:12-slim AS base

ENV DEBIAN_FRONTEND=noninteractive

 RUN apt-get update \
 && apt-get install -y curl \
                       gstreamer1.0-alsa \
                       gstreamer1.0-plugins-good \
                       gstreamer1.0-plugins-ugly \
                       gstreamer1.0-plugins-bad \
                       python3-gst-1.0 \
                       python3-lxml \
                       python3-pip \
                       python3-setuptools \
                       python3-wheel \
                       libasound2-dev \
 && apt purge --auto-remove -y \
    gcc \
 && apt clean \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* ~/.cache /root/.cache

ADD --chmod=755 ./requirements.txt /requirements.txt

# RUN pip3 install -r requirements.txt \
RUN pip install --break-system-packages -r requirements.txt \
 && rm -rf ~/.cache/pip \
 && apt purge --auto-remove -y \
    gcc \
 && apt clean \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* ~/.cache /root/.cache

RUN update-ca-certificates --fresh


ENV TZ=Asia/Shanghai

EXPOSE 6600 6680

ENTRYPOINT ["mopidy"]
