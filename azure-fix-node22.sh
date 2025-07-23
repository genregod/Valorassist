#!/bin/bash

echo "=== Fixing Azure Node.js Version and Dependencies ==="

# Login check
echo "Checking Azure login status..."
if ! az account show &>/dev/null; then
    echo "Please login to Azure first:"
    echo "az login --use-device-code"
    exit 1
fi

# Fix 1: Force Node.js 22 in Azure
echo "Setting Node.js 22 runtime..."
az webapp config set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --linux-fx-version "NODE|22-lts"

# Fix 2: Update all app settings
echo "Updating application settings..."
az webapp config appsettings set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --settings \
    WEBSITE_NODE_DEFAULT_VERSION="22.15.0" \
    WEBSITE_NPM_DEFAULT_VERSION="10.9.2" \
    NODE_VERSION="22" \
    SCM_DO_BUILD_DURING_DEPLOYMENT="true" \
    WEBSITE_RUN_FROM_PACKAGE="0" \
    WEBSITES_ENABLE_APP_SERVICE_STORAGE="true"

# Fix 3: Set startup command directly
echo "Setting startup command..."
az webapp config set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --startup-file "./startup.sh"

# Fix 4: Restart the app
echo "Restarting application..."
az webapp restart --name valor-assist-service --resource-group valor-assist-rg

echo ""
echo "=== Fix Applied! ==="
echo "The app will restart with Node.js 22 and install dependencies."
echo "Check the logs in 2-3 minutes at:"
echo "https://valor-assist-service.scm.azurewebsites.net/api/logs/docker"