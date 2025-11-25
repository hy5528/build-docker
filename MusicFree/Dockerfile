FROM node:18-alpine AS frontend-builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json ./
RUN pnpm install
RUN pnpm build

CMD ["npx"]
