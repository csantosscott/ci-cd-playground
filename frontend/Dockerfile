# Multi-stage build for Next.js frontend
# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Accept build-time arguments
ARG NEXT_PUBLIC_API_URL=https://ci-cd-demo-backend-160544606445.us-central1.run.app
ARG NEXT_PUBLIC_WS_URL=wss://ci-cd-demo-backend-160544606445.us-central1.run.app

# Set environment variables for build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

# Debug: Print environment variables
RUN echo "Building with NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"
RUN echo "Building with NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL"

# Build the application
RUN npm run build

# Stage 2: Production stage with Nginx
FROM nginx:alpine AS production

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy built application
COPY --from=builder /app/out /usr/share/nginx/html

# Copy custom nginx configuration template
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Set default port for Cloud Run
ENV PORT=3000

# Expose the port
EXPOSE $PORT

# Health check (use PORT variable)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/ || exit 1

# Start nginx with port substitution
CMD envsubst '$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g "daemon off;"