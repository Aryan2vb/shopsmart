# Stage 1: install production dependencies
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: run the server as a non-root user
FROM node:20-alpine AS runner

ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY server.js ./

RUN addgroup -S shopsmart && adduser -S shopsmart -G shopsmart
USER shopsmart

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

CMD ["npm", "start"]
