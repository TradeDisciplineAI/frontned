# ── Stage 1: Build Frontend SPA Static Assets ──────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application source code
COPY . .

# Build arguments for production environment
ARG VITE_API_BASE_URL=https://tradingcopilot.duckdns.org
ARG VITE_MARKET_API_BASE_URL=https://tradingcopilot.duckdns.org
ARG VITE_MARKET_WS_BASE_URL=wss://tradingcopilot.duckdns.org
ARG VITE_AI_SERVICE_API_URL=https://tradingcopilot.duckdns.org
ARG VITE_AI_API_BASE_URL=https://tradingcopilot.duckdns.org

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_MARKET_API_BASE_URL=${VITE_MARKET_API_BASE_URL}
ENV VITE_MARKET_WS_BASE_URL=${VITE_MARKET_WS_BASE_URL}
ENV VITE_AI_SERVICE_API_URL=${VITE_AI_SERVICE_API_URL}
ENV VITE_AI_API_BASE_URL=${VITE_AI_API_BASE_URL}
ENV VITE_APP_ENV=production

# Compile static bundle to /app/dist
RUN npm run build

# ── Stage 2: Serve SPA via NGINX High-Performance Web Server ────────────────
FROM nginx:alpine AS runner

# Copy custom NGINX configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static distribution files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
