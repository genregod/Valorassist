#!/bin/bash

echo "=== Fixing Azure Deployment Issues ==="

# 1. Configure Azure App Service via CLI
echo "Configuring Azure App Service settings..."

az webapp config set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --linux-fx-version "NODE|22-lts" \
  --startup-file "node dist/index.js"

# 2. Set environment variables
echo "Setting environment variables..."

az webapp config appsettings set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --settings \
    WEBSITE_NODE_DEFAULT_VERSION="~22" \
    WEBSITE_NPM_DEFAULT_VERSION="10.9.2" \
    SCM_DO_BUILD_DURING_DEPLOYMENT="false" \
    WEBSITE_RUN_FROM_PACKAGE="0" \
    NODE_ENV="production"

# 3. Restart the app
echo "Restarting application..."
az webapp restart --name valor-assist-service --resource-group valor-assist-rg

echo "Fix applied! Check the logs in a few minutes."
