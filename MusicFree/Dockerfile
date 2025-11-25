FROM node:18-alpine AS frontend-builder
WORKDIR /app
RUN npm install -g pnpm
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install
RUN pnpm build

CMD ["npx"]
