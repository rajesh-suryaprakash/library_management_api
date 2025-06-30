#!/bin/sh

# This script runs when the Docker container starts.
# It first seeds the database and then starts the main application.

# Exit immediately if a command exits with a non-zero status.
set -e

# Run the database seeder
echo "--- Running Database Seeder ---"
node src/db/seed.js

# Now, execute the main application command.
# 'exec' is important because it replaces the shell process with the Node process.
# This allows the Node app to receive signals correctly (like for graceful shutdown).
echo "--- Starting Application ---"
exec "$@"