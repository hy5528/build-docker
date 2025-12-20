FROM --platform=$BUILDPLATFORM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN pnpm install 

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs
WORKDIR /app

ENV NODE_ENV production


COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
