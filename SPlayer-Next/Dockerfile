# build
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

# install pnpm
RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# skip postinstall
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .
    

# 复制源代码并构建
COPY . .

RUN npm run build

# 运行阶段
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html


EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]



