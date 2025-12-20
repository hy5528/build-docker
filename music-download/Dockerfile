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

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production


COPY --from=builder /app/public ./public
COPY --from=builder /app/next/standalone ./
COPY --from=builder /app/next/static ./.next/static


EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
