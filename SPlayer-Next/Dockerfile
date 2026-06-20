# 构建阶段
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder
RUN npm install -g pnpm Rust
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./ ./
RUN pnpm install
COPY . .
RUN pnpm run build

# 运行阶段
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
