FROM --platform=$BUILDPLATFORM golang:alpine AS builder

RUN apk add --no-cache python3 py3-pip mopidy 
RUN git clone https://github.com/jaedb/Iris.git && \
cd Iris && \
pip install -e . && \
``` ‌:ml-citation{ref="2,3" data="citationList"}



EXPOSE 6600 6680

ENTRYPOINT ["mopidy"]
