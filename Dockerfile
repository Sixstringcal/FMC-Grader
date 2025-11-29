## Multi-stage Dockerfile
# Stage 1: build React client
FROM node:18-alpine AS builder
WORKDIR /app

# Copy only package.json first for better caching
COPY client/package.json ./client/package.json
WORKDIR /app/client
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: production image for Node server
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production

# Install server dependencies
COPY server/package.json ./server/package.json
WORKDIR /app/server
RUN npm install --production

# Copy server source
COPY server/ ./

# Copy client build from builder stage
COPY --from=builder /app/client/build /app/client/build

EXPOSE 5000
CMD ["node", "server/index.js"]
