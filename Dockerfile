# Build stage. Runs on the build host's native platform: the output is static
# files, so multi-arch images don't need to run npm/vite under emulation.
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json /app/

# Install all dependencies (including devDependencies) for building
RUN npm ci

# Copy source code and configuration files
COPY ./src /app/src
COPY ./public /app/public
COPY ./vite.config.ts ./tsconfig*.json ./eslint.config.js ./postcss.config.cjs ./index.html /app/
COPY ./.env.production /app/

# Build the application
RUN npm run build

# Production stage
FROM caddy:2-alpine

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/dist /app/dist
COPY Caddyfile /etc/caddy/Caddyfile
COPY env.sh /env.sh
RUN chmod +x /env.sh

# Expose port 5173
EXPOSE 5173

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:5173/ || exit 1

ENTRYPOINT ["/env.sh"]

# Start Caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"] 