# Stage 1: build the React client
FROM node:20-alpine AS client-build

WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# Stage 2: install production server dependencies
FROM node:20-alpine AS server-deps

WORKDIR /app/server

COPY server/package*.json ./
RUN npm ci --omit=dev

# Stage 3: run the server and serve the built client
FROM node:20-alpine AS runner

ENV NODE_ENV=production
WORKDIR /app

COPY --from=server-deps /app/server/node_modules ./node_modules
COPY server/package*.json ./
COPY server/server.js ./
COPY --from=client-build /app/client/dist ./public

RUN addgroup -S shopsmart && adduser -S shopsmart -G shopsmart
USER shopsmart

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

CMD ["npm", "start"]
