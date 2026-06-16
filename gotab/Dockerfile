# 构建阶段
FROM --platform=$BUILDPLATFORM alpine AS builder

ARG TARGETOS
ARG TARGETARCH
ARG SERVER_PORT=8080   # 构建阶段默认值

WORKDIR /app

COPY gotab-server-${TARGETOS}-${TARGETARCH} gotab-server
RUN chmod +x gotab-server

COPY web ./web/

# =============================
# 最终运行环境
# =============================
FROM alpine

WORKDIR /app

COPY --from=builder /app/gotab-server .
COPY --from=builder /app/web ./web/

# 定义运行时环境变量
ENV SERVER_PORT=8080
EXPOSE ${SERVER_PORT}

CMD ["sh", "-c", "echo Running server on port $SERVER_PORT && ./gotab-server -port=$SERVER_PORT"]
