#!/bin/bash

# Azure Setup Script for Valor Assist
# This script creates all necessary Azure resources for deployment

set -e

# Configuration
RESOURCE_GROUP="valor-assist-rg"
LOCATION="southeastasia"
APP_NAME="valor-assist"
PLAN_NAME="valor-assist-plan"
DB_SERVER_NAME="valor-assist-db"
DB_NAME="valorassist"
DB_ADMIN="valoradmin"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Valor Assist Azure Setup ===${NC}"
echo ""

# Check if logged in to Azure
echo -e "${YELLOW}Checking Azure login status...${NC}"
if ! az account show > /dev/null 2>&1; then
    echo -e "${RED}Not logged in to Azure. Please run 'az login' first.${NC}"
    exit 1
fi

# Show current subscription
SUBSCRIPTION=$(az account show --query name -o tsv)
echo -e "${GREEN}Using subscription: $SUBSCRIPTION${NC}"
echo ""

# Create Resource Group
echo -e "${YELLOW}Creating Resource Group...${NC}"
az group create \
    --name $RESOURCE_GROUP \
    --location $LOCATION \
    --output table

# Create App Service Plan
echo -e "${YELLOW}Creating App Service Plan...${NC}"
az appservice plan create \
    --name $PLAN_NAME \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku B1 \
    --is-linux \
    --output table

# Create Web App
echo -e "${YELLOW}Creating Web App...${NC}"
az webapp create \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --plan $PLAN_NAME \
    --runtime "NODE:22-lts" \
    --output table

# Configure Web App settings
echo -e "${YELLOW}Configuring Web App settings...${NC}"
az webapp config set \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --startup-file "cd /home/site/wwwroot && node dist/index.js" \
    --output table

# Enable WebSockets
echo -e "${YELLOW}Enabling WebSockets...${NC}"
az webapp config set \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --web-sockets-enabled true \
    --output table

# Create PostgreSQL Database
echo -e "${YELLOW}Creating PostgreSQL Database Server...${NC}"
echo -e "${RED}Note: You'll be prompted for a database password${NC}"
read -s -p "Enter password for PostgreSQL admin user: " DB_PASSWORD
echo ""

az postgres flexible-server create \
    --name $DB_SERVER_NAME \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --admin-user $DB_ADMIN \
    --admin-password "$DB_PASSWORD" \
    --sku-name Standard_B1ms \
    --tier Burstable \
    --storage-size 32 \
    --version 15 \
    --yes \
    --output table

# Create database
echo -e "${YELLOW}Creating database...${NC}"
az postgres flexible-server db create \
    --server-name $DB_SERVER_NAME \
    --resource-group $RESOURCE_GROUP \
    --database-name $DB_NAME \
    --output table

# Configure firewall rule for Azure services
echo -e "${YELLOW}Configuring database firewall...${NC}"
az postgres flexible-server firewall-rule create \
    --name AllowAzureServices \
    --server-name $DB_SERVER_NAME \
    --resource-group $RESOURCE_GROUP \
    --start-ip-address 0.0.0.0 \
    --end-ip-address 0.0.0.0 \
    --output table

# Get connection string
DB_HOST=$(az postgres flexible-server show \
    --name $DB_SERVER_NAME \
    --resource-group $RESOURCE_GROUP \
    --query fullyQualifiedDomainName -o tsv)

DATABASE_URL="postgresql://${DB_ADMIN}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}?sslmode=require"

# Set app settings
echo -e "${YELLOW}Configuring application settings...${NC}"
echo -e "${RED}Note: You'll need to provide API keys${NC}"
read -p "Enter OpenAI API Key: " OPENAI_API_KEY
read -p "Enter Azure Communication Connection String: " AZURE_COMM_STRING
read -p "Enter Session Secret (or press enter for random): " SESSION_SECRET

if [ -z "$SESSION_SECRET" ]; then
    SESSION_SECRET=$(openssl rand -base64 32)
fi

az webapp config appsettings set \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --settings \
        NODE_ENV=production \
        DATABASE_URL="$DATABASE_URL" \
        OPENAI_API_KEY="$OPENAI_API_KEY" \
        AZURE_COMMUNICATION_CONNECTION_STRING="$AZURE_COMM_STRING" \
        SESSION_SECRET="$SESSION_SECRET" \
        WEBSITE_NODE_DEFAULT_VERSION=22 \
    --output table

# Download publish profile
echo -e "${YELLOW}Downloading publish profile...${NC}"
az webapp deployment list-publishing-profiles \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --xml > publish-profile.xml

echo ""
echo -e "${GREEN}=== Setup Complete! ===${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Copy the contents of publish-profile.xml to GitHub secret AZURE_WEBAPP_PUBLISH_PROFILE"
echo "2. Delete publish-profile.xml after copying (contains sensitive data)"
echo "3. Push to main branch to trigger deployment"
echo ""
echo -e "${GREEN}Web App URL: https://${APP_NAME}.azurewebsites.net${NC}"
echo -e "${GREEN}Health Check: https://${APP_NAME}.azurewebsites.net/api/health${NC}"
echo ""
echo -e "${YELLOW}Resource Group: $RESOURCE_GROUP${NC}"
echo -e "${YELLOW}To delete all resources: az group delete --name $RESOURCE_GROUP${NC}"