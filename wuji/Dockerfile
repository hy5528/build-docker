# Build stage
FROM node:24-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
    curl \
    build-base \
    perl \
    llvm-dev \
    clang-dev

# Allow linking libclang on musl
ENV RUSTFLAGS="-C target-feature=-crt-static"

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

ARG POSTHOG_API_KEY
ARG POSTHOG_API_ENDPOINT

ENV VITE_PUBLIC_POSTHOG_KEY=$POSTHOG_API_KEY
ENV VITE_PUBLIC_POSTHOG_HOST=$POSTHOG_API_ENDPOINT

# Set working directory
WORKDIR /app

# Copy package files for dependency caching
COPY package*.json pnpm-workspace.yaml ./


# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install

# 复制源代码并构建
COPY . .
RUN pnpm tauri build

# 第二阶段：生产环境
FROM nginx:1.29.3-alpine3.22-slim AS app

WORKDIR /app

# 从构建阶段复制打包结果
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义nginx配置（如有需要）
# COPY nginx.conf /etc/nginx/nginx.con



EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
