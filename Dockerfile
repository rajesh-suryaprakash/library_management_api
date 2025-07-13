# # ---- Stage 1: The Builder ----
# # This stage prepares all necessary source code, dependencies, and CLEANED data.
# FROM node:18.16.1-alpine AS builder

# WORKDIR /usr/src/app

# # --- FIX: Bypass corporate SSL proxy for package installation ---
# # This command switches the package repositories from https to http.
# RUN sed -i 's/https/http/' /etc/apk/repositories

# # Copy package files and install ALL dependencies (including dev deps for the cleanse script)
# COPY package*.json ./

# # Set npm to use http instead of https for the registry to avoid SSL issues
# RUN npm config set strict-ssl false

# # Install all dependencies, including dev dependencies for any build steps
# RUN npm install

# # Set npm back to use https for security
# RUN npm config set strict-ssl true


# # Copy all source code, including the raw data files
# COPY . .

# # --- Stage 2: The Runner (Final Image) ---
# FROM node:18.16.1-alpine

# WORKDIR /usr/src/app

# # Install necessary system packages for healthcheck
# RUN apk update && apk add --no-cache wget

# ENV NODE_ENV=production

# # Copy ONLY production dependencies from the builder
# COPY --from=builder /usr/src/app/node_modules ./node_modules
# COPY package*.json ./
# # Note: You could re-run 'npm ci --omit=dev' here for a smaller image, but this is simpler.

# # Copy the application source code
# COPY --from=builder /usr/src/app/src ./src

# # --- IMPORTANT: Copy the CLEANED data files from the builder ---
# COPY --from=builder /usr/src/app/src/db/authors.json ./src/db/authors.json
# COPY --from=builder /usr/src/app/src/db/books.json ./src/db/books.json

# # Copy and prepare the entrypoint script
# COPY entrypoint.sh .
# RUN chmod +x ./entrypoint.sh

# # Create a non-root user and set permissions
# RUN addgroup -S -g 1001 appgroup && adduser -S -u 1001 -G appgroup appuser
# RUN chown -R appuser:appgroup /usr/src/app
# USER appuser

# # --- Metadata Labels ---
# LABEL maintainer="Rajesh Suryaprakash <rajesh.learning1994@gmail.com>"
# LABEL version="1.0"
# LABEL description="Library Management System API for testing purposes."
# LABEL org.opencontainers.image.source="https://github.com/your-repo/library-api"

# # Metadata, Healthcheck, Expose Port... (remain the same)
# EXPOSE 3000
# HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#   CMD wget -q --spider http://localhost:3000/ || exit 1

# # Use the entrypoint script to start the container
# # This entrypoint will now run the seeder using the authors.json & books.json files
# ENTRYPOINT ["./entrypoint.sh"]
# CMD ["node", "src/index.js"]


# ---- Stage 1: The Builder ----
# This stage prepares all necessary source code and dependencies.
FROM node:18.16.1-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Set npm to use http instead of https for the registry to avoid SSL issues
RUN npm config set strict-ssl false

# Install all dependencies, including dev dependencies for any build steps
RUN npm install

# Set npm back to use https for security
RUN npm config set strict-ssl true

# Copy all project source code
COPY . .

# Run data preparation scripts if you have them.
# For example, if you still use cleanse/enrich scripts:
# RUN npm run cleanse
# RUN npm run enrich:books


# --- Stage 2: The Final Production Runner ---
FROM node:18.16.1-alpine

WORKDIR /usr/src/app

# This command switches the package repositories from https to http.
RUN sed -i 's/https/http/' /etc/apk/repositories

# Install necessary system packages for healthcheck
RUN apk update && apk add --no-cache wget

ENV NODE_ENV=production

# Copy necessary files from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/entrypoint.sh ./entrypoint.sh

# Make the entrypoint script executable
RUN chmod +x ./entrypoint.sh

# Create a non-root user and set permissions
RUN addgroup -S -g 1001 appgroup && adduser -S -u 1001 -G appgroup appuser
RUN chown -R appuser:appgroup /usr/src/app
USER appuser

# Metadata, Healthcheck, Expose Port
LABEL maintainer="Rajesh Suryaprakash <rajesh.learning1994@gmail.com>"
LABEL version="1.0"
LABEL description="Library Management System API for testing purposes."
LABEL org.opencontainers.image.source="https://github.com/your-repo/library-api"

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost:3000/ || exit 1

# Use the entrypoint script to start the container
ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "src/index.js"]