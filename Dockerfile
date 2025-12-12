# Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src
COPY config.json ./

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /usr/src/app/build ./build
COPY --from=builder /usr/src/app/src/public ./src/public
COPY config.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /usr/src/app

USER nodejs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:8080/', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the app
CMD ["node", "build/src/index.js"]
