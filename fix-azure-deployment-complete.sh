#!/bin/bash

echo "=== Azure Deployment Complete Fix ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}1. Checking Azure login status...${NC}"
if ! az account show &>/dev/null; then
    echo -e "${RED}Please login to Azure first:${NC}"
    echo "az login --use-device-code"
    exit 1
fi

echo -e "${YELLOW}2. Configuring Azure App Service for proper deployment...${NC}"

# Set the correct Node.js version
echo "   - Setting Node.js 22 LTS..."
az webapp config set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --linux-fx-version "NODE|22-lts"

# Set the startup command to use our server.js
echo "   - Setting startup command..."
az webapp config set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --startup-file "node server.js"

# Configure environment variables
echo "   - Setting environment variables..."
az webapp config appsettings set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --settings \
    PORT="8080" \
    NODE_ENV="production" \
    WEBSITE_NODE_DEFAULT_VERSION="~22" \
    WEBSITE_NPM_DEFAULT_VERSION="10.9.2" \
    SCM_DO_BUILD_DURING_DEPLOYMENT="true" \
    WEBSITE_RUN_FROM_PACKAGE="0"

echo ""
echo -e "${YELLOW}3. Restarting the application...${NC}"
az webapp restart --name valor-assist-service --resource-group valor-assist-rg

echo ""
echo -e "${GREEN}=== Fix Complete! ===${NC}"
echo ""
echo "Your app should now:"
echo "✓ Use Node.js 22 LTS"
echo "✓ Run on port 8080 (Azure standard)"
echo "✓ Use the simplified server.js"
echo "✓ Build during deployment"
echo "✓ Serve static files correctly"
echo ""
echo -e "${YELLOW}Monitor your deployment at:${NC}"
echo "- App: https://valor-assist-service.azurewebsites.net"
echo "- Health Check: https://valor-assist-service.azurewebsites.net/health" 
echo "- API Health: https://valor-assist-service.azurewebsites.net/api/health"
echo "- Logs: https://valor-assist-service.scm.azurewebsites.net/api/logs/docker"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Wait 2-3 minutes for the restart to complete"
echo "2. Check the health endpoints above"
echo "3. If still not working, check the Azure logs for detailed error information"
echo ""
echo -e "${GREEN}The application should be working within a few minutes!${NC}"
