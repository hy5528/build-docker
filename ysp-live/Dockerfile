FROM docker.m.daocloud.io/library/python:3.12-alpine

ENV TZ=Asia/Shanghai \
    PYTHONUNBUFFERED=1 \
    YSP_DATA_DIR=/app/data

RUN apk add --no-cache nodejs tzdata ca-certificates && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    mkdir -p /app /app/data

WORKDIR /app

COPY ysp-live-v9.8-TMXK.py /app/ysp-live-v9.8-TMXK.py
COPY ysp-engine.js /app/ysp-engine.js

RUN ln -sf /app/ysp-live-v9.8-TMXK.py /app/ysp-live.py

EXPOSE 8767
VOLUME ["/app/data"]

CMD ["sh", "-c", "mkdir -p /app/data && chmod -R 777 /app/data 2>/dev/null || true; exec python3 /app/ysp-live-v9.8-TMXK.py 8767"]
