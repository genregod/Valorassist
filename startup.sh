#!/bin/bash

# Azure App Service startup script
echo "Starting Valor Assist application..."

# Ensure we're in the correct directory
cd /home/site/wwwroot

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "Error: dist directory not found. Build may have failed."
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
node dist/index.js