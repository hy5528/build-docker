FROM --platform=$BUILDPLATFORM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json  pnpm-lock.yaml* .npmrc* ./


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application
RUN set -ex && \
  if [ -f yarn.lock ]; then \
    echo "Building with Yarn..." && yarn run build 2>&1; \
  elif [ -f package-lock.json ]; then \
    echo "Building with NPM..." && npm run build 2>&1; \
  elif [ -f pnpm-lock.yaml ]; then \
    echo "Building with PNPM..." && corepack enable pnpm && pnpm run build 2>&1; \
  else \
    echo "ERROR: Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next && \
  chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
# Bind the standalone server to all container interfaces.
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
