#!/bin/bash

# Azure App Service startup script
echo "Starting Valor Assist application..."
echo "Current Node.js version: $(node --version)"
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Ensure we're in the correct directory
cd /home/site/wwwroot

# Install production dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
    echo "node_modules not found. Installing production dependencies..."
    npm ci --production
    echo "Dependencies installed."
fi

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "Error: dist directory not found. Build may have failed."
    echo "Full directory listing:"
    find . -type f -name "*.js" | head -20
    exit 1
fi

# Check if index.js exists
if [ ! -f "dist/index.js" ]; then
    echo "Error: dist/index.js not found. Build may have failed."
    exit 1
fi

# Set Node.js options for production
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=2048"

# Start the application
echo "Starting Node.js application from dist/index.js..."
echo "Using Node.js: $(which node)"
node dist/index.js