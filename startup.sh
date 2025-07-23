#!/bin/bash

echo "Starting Valor Assist application..."

# Always install dependencies first
cd /home/site/wwwroot
echo "Installing dependencies..."
npm install --production

# Start the application
echo "Starting Node.js application from dist/index.js..."
node dist/index.js