#!/bin/bash

# Azure App Service startup script
echo "=== Valor Assist Startup Script ==="
echo "Node.js version: $(node --version)"
echo "Working directory: $(pwd)"

# Change to app directory
cd /home/site/wwwroot || exit 1

# Always install dependencies on Azure
echo "Installing production dependencies..."
npm ci --production --legacy-peer-deps

# Verify installation
if [ ! -d "node_modules/express" ]; then
    echo "ERROR: Express module not found after installation!"
    echo "Attempting alternative installation..."
    npm install --production --legacy-peer-deps
fi

# Check dist directory
if [ ! -d "dist" ]; then
    echo "ERROR: dist directory not found!"
    ls -la
    exit 1
fi

# Start the application
echo "Starting application..."
export NODE_ENV=production
node dist/index.js