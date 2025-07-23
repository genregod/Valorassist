#!/bin/bash

echo "=== Azure Deployment Complete Fix ==="
echo ""

# Step 1: Commit and push all changes
echo "1. Preparing files for deployment..."
git add .
git commit -m "Fix: Azure deployment configuration with port 8080 and proper build setup"
git push origin main

echo ""
echo "2. Configuring Azure App Service..."

# Login check
if ! az account show &>/dev/null; then
    echo "Please login to Azure first:"
    echo "az login --use-device-code"
    exit 1
fi

# Set Node.js version to 22
echo "   - Setting Node.js 22..."
az webapp config set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --linux-fx-version "NODE|22-lts"

# Set startup command
echo "   - Setting startup command..."
az webapp config set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --startup-file "node server.js"

# Set environment variables
echo "   - Setting environment variables..."
az webapp config appsettings set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --settings \
    PORT="8080" \
    NODE_ENV="production" \
    SCM_DO_BUILD_DURING_DEPLOYMENT="true"

# Enable build automation
echo "   - Enabling build automation..."
az webapp config set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --auto-heal-enabled true

echo ""
echo "3. Restarting application..."
az webapp restart --name valor-assist-service --resource-group valor-assist-rg

echo ""
echo "=== Deployment Fix Complete! ==="
echo ""
echo "The deployment will now:"
echo "✓ Use Node.js 22 LTS"
echo "✓ Run on port 8080"
echo "✓ Build during deployment"
echo "✓ Start from server.js"
echo ""
echo "Monitor deployment at:"
echo "- App: https://valor-assist-service.azurewebsites.net"
echo "- Logs: https://valor-assist-service.scm.azurewebsites.net/api/logs/docker"
echo "- Deployment Center: https://portal.azure.com"