#!/bin/bash
# Post-deployment script for Azure
echo "Running post-deployment tasks..."

# Ensure we're using Node.js 22
export NODE_VERSION=22

# Install production dependencies
echo "Installing production dependencies..."
npm ci --production --legacy-peer-deps

echo "Post-deployment complete!"