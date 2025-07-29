#!/bin/bash

echo "Starting Valor Assist application..."
echo "Node.js version: $(node --version)"
echo "Environment: $NODE_ENV"
echo "Port: $PORT"

# Start the application with the built version
exec node dist/index.js
