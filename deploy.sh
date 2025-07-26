#!/bin/bash

echo "=== Azure Deployment Script ==="
echo "Current directory: $(pwd)"
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

echo "Build complete. Contents of dist directory:"
ls -la dist/ || echo "dist directory not found"

if [ -d "dist/public" ]; then
  echo "Contents of dist/public:"
  ls -la dist/public/
else
  echo "dist/public directory not found"
fi

echo "=== Deployment Script Complete ==="
