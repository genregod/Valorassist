#!/bin/bash

# Deployment script for Valor Assist to Azure
# This script sets up Azure resources according to azure-deploy.json configuration

# Load configuration
config=$(cat azure-deploy.json)
resourceGroupName=$(echo $config | jq -r '.resourceGroupName')
location=$(echo $config | jq -r '.location')
appName=$(echo $config | jq -r '.appName')

# API Management config
apimName=$(echo $config | jq -r '.apiManagement.name')
publisherEmail=$(echo $config | jq -r '.apiManagement.publisherEmail')
publisherName=$(echo $config | jq -r '.apiManagement.publisherName')
apimSkuName=$(echo $config | jq -r '.apiManagement.sku.name')
apimCapacity=$(echo $config | jq -r '.apiManagement.sku.capacity')

# Database config
dbName=$(echo $config | jq -r '.database.name')
dbLocation=$(echo $config | jq -r '.database.location')
dbAdminLogin=$(echo $config | jq -r '.database.adminLogin')
dbVersion=$(echo $config | jq -r '.database.version')

# App Service config
appServiceName=$(echo $config | jq -r '.appService.name')
appServicePlanName=$(echo $config | jq -r '.appService.planName')
appServiceSkuName=$(echo $config | jq -r '.appService.sku.name')
appServiceTier=$(echo $config | jq -r '.appService.sku.tier')

# AI Services config
aiServicesName=$(echo $config | jq -r '.aiServices.name')
aiServicesSku=$(echo $config | jq -r '.aiServices.sku')

# Print deployment plan
echo "=== Valor Assist Azure Deployment Plan ==="
echo "Resource Group: $resourceGroupName in $location"
echo "App Name: $appName"
echo "Database: $dbName in $dbLocation"
echo "API Management: $apimName"
echo "App Service: $appServiceName"
echo "AI Services: $aiServicesName"
echo "========================================="

# Ask for confirmation
read -p "Proceed with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Deployment cancelled."
    exit 1
fi

# Check if Azure CLI is installed
if ! command -v az &> /dev/null
then
    echo "Azure CLI not found. Please install Azure CLI first."
    echo "Visit https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Login to Azure
echo "Logging in to Azure..."
az login

# Create resource group
echo "Creating resource group..."
az group create --name $resourceGroupName --location $location

# Create PostgreSQL server in Asia region as requested
echo "Creating PostgreSQL server..."
adminPassword=$(openssl rand -base64 16)
az postgres server create \
  --resource-group $resourceGroupName \
  --name $dbName \
  --location $dbLocation \
  --admin-user $dbAdminLogin \
  --admin-password $adminPassword \
  --sku-name GP_Gen5_2 \
  --version $dbVersion \
  --storage-size 51200

# Create database
echo "Creating database..."
az postgres db create \
  --resource-group $resourceGroupName \
  --server-name $dbName \
  --name valorassist

# Configure firewall rules to allow Azure services
echo "Configuring database firewall..."
az postgres server firewall-rule create \
  --resource-group $resourceGroupName \
  --server-name $dbName \
  --name AllowAllAzureIPs \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Create App Service Plan
echo "Creating App Service Plan..."
az appservice plan create \
  --name $appServicePlanName \
  --resource-group $resourceGroupName \
  --location $location \
  --sku $appServiceSkuName

# Create App Service
echo "Creating App Service..."
az webapp create \
  --name $appServiceName \
  --resource-group $resourceGroupName \
  --plan $appServicePlanName \
  --runtime "NODE:20-lts"

# Create API Management instance
echo "Creating API Management service..."
az apim create \
  --name $apimName \
  --resource-group $resourceGroupName \
  --publisher-email $publisherEmail \
  --publisher-name "$publisherName" \
  --sku-name $apimSkuName \
  --sku-capacity $apimCapacity \
  --location $location

# Create Cognitive Services account for AI
echo "Creating AI Services account..."
az cognitiveservices account create \
  --name $aiServicesName \
  --resource-group $resourceGroupName \
  --kind CognitiveServices \
  --sku $aiServicesSku \
  --location $location

# Configure environment variables for the web app
echo "Configuring environment variables..."
az webapp config appsettings set \
  --name $appServiceName \
  --resource-group $resourceGroupName \
  --settings \
    DATABASE_URL="postgres://$dbAdminLogin:$adminPassword@$dbName.postgres.database.azure.com:5432/valorassist?sslmode=require" \
    NODE_ENV="production" \
    OPENAI_API_KEY="to-be-set-manually"

echo "Setting up deployment from GitHub..."
# Note: This would need to be replaced with actual GitHub repo details
# az webapp deployment source config --name $appServiceName \
#   --resource-group $resourceGroupName \
#   --repo-url https://github.com/yourusername/valor-assist \
#   --branch main --manual-integration

echo "=== Deployment Complete ==="
echo "Database Password (SAVE THIS): $adminPassword"
echo
echo "Next steps:"
echo "1. Set the OPENAI_API_KEY in the App Service configuration"
echo "2. Set up continuous deployment from your GitHub repository"
echo "3. Configure API Management with your API endpoints"
echo "4. Set up monitoring and alerts"
echo

# Store connection info to a file (be careful with this in production)
echo "Saving connection information to valor-assist-credentials.txt..."
cat > valor-assist-credentials.txt << EOL
Resource Group: $resourceGroupName
Database Server: $dbName.postgres.database.azure.com
Database Name: valorassist
Database Admin: $dbAdminLogin
Database Password: $adminPassword
Database Connection String: postgres://$dbAdminLogin:$adminPassword@$dbName.postgres.database.azure.com:5432/valorassist?sslmode=require
App Service: $appServiceName.azurewebsites.net
API Management: $apimName.azure-api.net
EOL

echo "Credentials saved to valor-assist-credentials.txt"