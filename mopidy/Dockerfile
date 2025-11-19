# 构建阶段
FROM python:3.12-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgirepository1.0-dev \
    libcairo2-dev \
    gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir setuptools>=66 setuptools-scm>=7.1 build

RUN python -m build --wheel --no-isolation

# 运行阶段
FROM python:3.12-alpine
WORKDIR /app
RUN apk add --no-cache \
    libgirepository \
    libcairo \
    glib \
    && rm -rf /var/cache/apk/*
COPY --from=builder /app/dist/*.whl .
RUN pip install --no-cache-dir --no-deps *.whl && rm -rf *.whl /tmp/*
RUN adduser -D mopidy && mkdir -p /app/config && chown -R mopidy:mopidy /app
USER mopidy
EXPOSE 6680
CMD ["mopidy"]
