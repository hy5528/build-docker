# Stage 1: Build the Next.js application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency definition files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application source code
COPY . .

# Build-time argument for the API URL
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build the application
RUN pnpm build

# Stage 2: Production image
FROM node:18-alpine AS runner

WORKDIR /app

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from the builder stage
# Copy public assets
COPY --from=builder /app/public ./public
# Copy standalone server and static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set the user
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Set the environment variable for the port
ENV PORT=3000

# Command to run the standalone server
CMD ["node", "server.js"]