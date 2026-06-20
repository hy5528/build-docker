# build
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

# install pnpm
RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# skip postinstall
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .



# skip native build for web deployment
# ENV SKIP_NATIVE_BUILD=true
RUN npx electron-vite build

# 运行阶段
FROM nginx:alpine
# COPY --from=builder /app/dist /usr/share/nginx/html

COPY --from=builder /app/out/renderer /usr/share/nginx/html
EXPOSE 80


CMD ["nginx", "-g", "daemon off;"]

