#!/bin/bash

echo "Starting Valor Assist application..."
echo "Node.js version: $(node --version)"
echo "Environment: $NODE_ENV"
echo "Port: $PORT"

# Start the application
exec node server.js
