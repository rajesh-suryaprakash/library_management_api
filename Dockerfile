# This Dockerfile is designed to build a Node.js application in two stages:
# 1. The Builder stage installs all dependencies, including devDependencies.
# 2. The Runner stage copies the necessary files and runs the application in production mode.
# It also includes an entrypoint script to handle the application startup.
# Use the official Node.js image as the base image for both stages
# Use the Alpine variant for a smaller image size

# ---- Stage 1: The Builder ----
# This stage installs ALL dependencies and creates the complete node_modules folder.
FROM node:18.16.1-alpine AS builder

WORKDIR /usr/src/app
COPY package*.json ./

# Set npm to use http instead of https for the registry to avoid SSL issues
RUN npm config set strict-ssl false

# Install all dependencies, including dev dependencies for any build steps
RUN npm install

# Set npm back to use https for security
RUN npm config set strict-ssl true

COPY . .

# --- Stage 2: The Runner (Final Image) ---
FROM node:18.16.1-alpine

WORKDIR /usr/src/app

# --- THE ALTERNATE FIX: Switch to HTTP ---
# This command finds all 'https' addresses in the repositories file and replaces them with 'http'.
# This bypasses the corporate SSL inspection that causes the certificate error.
RUN sed -i 's/https/http/' /etc/apk/repositories
# --- END FIX ---


# --- Install necessary system packages for healthcheck ---
# This command will now succeed because it's using plain HTTP.
RUN apk update && apk add --no-cache wget

ENV NODE_ENV=production

# Copy ALL node_modules from the builder
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy the application source code and package files
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/package*.json ./

# Copy and prepare the entrypoint script
COPY entrypoint.sh .
RUN chmod +x ./entrypoint.sh

# Create a non-root user and set permissions
RUN addgroup -S -g 1001 appgroup && adduser -S -u 1001 -G appgroup appuser
RUN chown -R appuser:appgroup /usr/src/app
USER appuser

# --- Metadata Labels ---
LABEL maintainer="Rajesh Suryaprakash <rajesh.learning1994@gmail.com>"
LABEL version="1.0"
LABEL description="Library Management System API for testing purposes."
LABEL org.opencontainers.image.source="https://github.com/your-repo/library-api"

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost:3000/ || exit 1

EXPOSE 3000

# Use the entrypoint script to start the container
ENTRYPOINT ["./entrypoint.sh"]

# The default command that gets passed to the entrypoint script
CMD ["node", "src/index.js"]