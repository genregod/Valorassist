#!/bin/bash

# Azure custom deployment script
echo "Starting Azure deployment..."

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Build the application
echo "Building application..."
npm run build

# The application will run from dist/index.js
echo "Deployment complete!"