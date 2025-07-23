#!/bin/bash

# Azure custom deployment script
echo "Starting Azure deployment..."

# Copy index.html to root for Vite build
if [ -f "client/index.html" ]; then
    echo "Copying index.html to root..."
    cp client/index.html ./index.html
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

# Clean up
rm -f index.html

# The application will run from dist/index.js
echo "Deployment complete!"