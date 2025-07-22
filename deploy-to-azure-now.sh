#!/bin/bash

# Deploy to Azure Script
# This script commits changes and deploys to Azure

set -e

echo "=== Valor Assist - Deploy to Azure ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
RESOURCE_GROUP="valor-assist-rg"
APP_NAME="valor-assist-service"

# Step 1: Git operations
echo -e "${YELLOW}Step 1: Preparing git repository...${NC}"
git add -A
git commit -m "Fix Azure deployment: Update startup configuration for dist folder" || echo "No changes to commit"

# Step 2: Azure login
echo -e "${YELLOW}Step 2: Logging into Azure...${NC}"
echo -e "${GREEN}Please follow the device code authentication process:${NC}"
az login --use-device-code

# Step 3: Verify subscription
echo -e "${YELLOW}Step 3: Verifying Azure subscription...${NC}"
SUBSCRIPTION=$(az account show --query name -o tsv)
echo -e "${GREEN}Using subscription: $SUBSCRIPTION${NC}"

# Step 4: Build the application
echo -e "${YELLOW}Step 4: Building application...${NC}"
npm run build

# Step 5: Create deployment package
echo -e "${YELLOW}Step 5: Creating deployment package...${NC}"
# Clean up old packages
rm -f deploy.zip

# Create deployment package with all necessary files
zip -r deploy.zip \
  dist/ \
  package.json \
  package-lock.json \
  web.config \
  startup.sh \
  ecosystem.config.js \
  .deployment \
  -x "node_modules/*" \
  -x ".git/*" \
  -x "*.log" \
  -x ".env"

echo -e "${GREEN}Deployment package created: deploy.zip${NC}"

# Step 6: Deploy to Azure
echo -e "${YELLOW}Step 6: Deploying to Azure Web App...${NC}"

# Stop the app first to ensure clean deployment
echo "Stopping web app..."
az webapp stop --name $APP_NAME --resource-group $RESOURCE_GROUP

# Deploy the package
echo "Deploying application..."
az webapp deployment source config-zip \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --src deploy.zip

# Configure startup command
echo "Configuring startup command..."
az webapp config set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --startup-file "./startup.sh"

# Set Node version
echo "Setting Node.js version..."
az webapp config appsettings set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings WEBSITE_NODE_DEFAULT_VERSION=~22

# Start the app
echo "Starting web app..."
az webapp start --name $APP_NAME --resource-group $RESOURCE_GROUP

# Step 7: Verify deployment
echo -e "${YELLOW}Step 7: Verifying deployment...${NC}"
sleep 10

# Check app status
echo "Checking application status..."
APP_URL="https://${APP_NAME}.azurewebsites.net"
HEALTH_URL="${APP_URL}/api/health"

echo "Waiting for app to start (this may take a minute)..."
for i in {1..12}; do
  if curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL | grep -q "200"; then
    echo -e "${GREEN}✓ Application is running!${NC}"
    echo -e "${GREEN}✓ Health check passed${NC}"
    break
  else
    echo "Attempt $i/12: Waiting for app to start..."
    sleep 10
  fi
done

# Show logs
echo -e "${YELLOW}Recent deployment logs:${NC}"
az webapp log tail \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --timeout 30 || true

echo ""
echo -e "${GREEN}=== Deployment Complete! ===${NC}"
echo -e "${GREEN}Application URL: $APP_URL${NC}"
echo -e "${GREEN}Health Check: $HEALTH_URL${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Visit your application at: $APP_URL"
echo "2. Check health status at: $HEALTH_URL"
echo "3. Monitor logs: az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP"
echo ""
echo -e "${YELLOW}If deployment fails, check:${NC}"
echo "- Azure Portal > App Service > Log stream"
echo "- Ensure all environment variables are set in Configuration"
echo "- Verify the dist folder was built correctly"