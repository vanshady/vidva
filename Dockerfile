# Build stage
FROM node:20-alpine AS builder

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

ENTRYPOINT ["/env.sh"]

# Start Caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"] 