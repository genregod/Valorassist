#!/bin/bash

echo "=== Final Azure Deployment Fix ==="
echo "This script fixes both the port issue and dependency installation"

# Check Azure login
if ! az account show &>/dev/null; then
    echo "Please login to Azure first:"
    echo "az login --use-device-code"
    exit 1
fi

echo "1. Setting startup command to install dependencies..."
az webapp config set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --startup-file "cd /home/site/wwwroot && npm install --production && PORT=8080 node dist/index.js"

echo "2. Setting environment variables..."
az webapp config appsettings set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --settings \
    PORT="8080" \
    NODE_ENV="production"

echo "3. Restarting application..."
az webapp restart --name valor-assist-service --resource-group valor-assist-rg

echo ""
echo "=== Fix Complete! ==="
echo "The app will now:"
echo "1. Install dependencies on startup"
echo "2. Listen on port 8080 (Azure's expected port)"
echo ""
echo "Check status at: https://valor-assist-service.azurewebsites.net"
echo "View logs at: https://valor-assist-service.scm.azurewebsites.net/api/logs/docker"