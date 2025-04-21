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

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Expose port 5173
EXPOSE 5173

# Start the application with explicit port and host
ENV PORT=5173
ENV HOST=0.0.0.0
CMD ["sh", "-c", "echo 'Starting server on $HOST:$PORT' && npm run preview -- --port $PORT --host $HOST"] 