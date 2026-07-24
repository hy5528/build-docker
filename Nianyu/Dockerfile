# 构建前端（需安装 devDependencies：vite、tailwind 等）
FROM --platform=$BUILDPLATFORM node:20-alpine AS client
WORKDIR /app/client
COPY client/package.json client/package-lock.json* ./
RUN npm ci 2>/dev/null || npm install
COPY client/ ./
RUN npm run build

# 运行后端并托管前端静态资源
FROM --platform=$BUILDPLATFORM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev
COPY server/ ./server/
COPY --from=client /app/client/dist ./client/dist
EXPOSE 5174
CMD ["node", "server/index.js"]
