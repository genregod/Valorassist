#!/bin/bash

set -euo pipefail
IFS=$'\n\t'

# --- Configuration Loading ---
CONFIG_FILE="azure-deploy.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: Configuration file not found at $CONFIG_FILE"
    exit 1
fi
echo "Configuration file found. Loading values..."

# Load values from JSON
resourceGroupName=$(jq -r '.resourceGroupName' "$CONFIG_FILE")
location=$(jq -r '.location' "$CONFIG_FILE")
appName=$(jq -r '.appName' "$CONFIG_FILE")
dbName=$(jq -r '.database.name' "$CONFIG_FILE")
dbAdminLogin=$(jq -r '.database.adminLogin' "$CONFIG_FILE")
appServiceName=$(jq -r '.appService.name' "$CONFIG_FILE")
aiServicesName=$(jq -r '.aiServices.name' "$CONFIG_FILE")
keyVaultName=$(jq -r '.keyVaultName' "$CONFIG_FILE")$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 4)

# 🔐 GitHub token from environment variable
github_token="${GITHUB_TOKEN:?Please export your GitHub token as GITHUB_TOKEN before running this script}"

# --- Resource Deployment ---
echo "-------------------------------------"
echo "Starting Azure resource deployment..."
echo "-------------------------------------"

echo "Creating resource group: $resourceGroupName..."
az group create --name "$resourceGroupName" --location "$location" --output json

echo "Creating Key Vault: $keyVaultName..."
az keyvault create --name "$keyVaultName" --resource-group "$resourceGroupName" --location "$location" --output json

echo "Generating secure SQL password and storing in Key Vault..."
sqlPassword=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32)
az keyvault secret set --vault-name "$keyVaultName" --name "sql-admin-password" --value "$sqlPassword" --output json

echo "Creating Azure SQL server: $dbName..."
az sql server create \
    --name "$dbName" \
    --resource-group "$resourceGroupName" \
    --location "$location" \
    --admin-user "$dbAdminLogin" \
    --admin-password "$(az keyvault secret show --vault-name "$keyVaultName" --name "sql-admin-password" --query "value" -o tsv)" \
    --output json

echo "Creating SQL database for app..."
az sql db create \
    --resource-group "$resourceGroupName" \
    --server "$dbName" \
    --name "${appName}-db" \
    --service-objective S0 \
    --output json

echo "Creating App Service Plan..."
az appservice plan create \
    --name "${appServiceName}-plan" \
    --resource-group "$resourceGroupName" \
    --sku B1 \
    --is-linux \
    --output json

echo "Creating App Service..."
az webapp create \
    --name "$appServiceName" \
    --resource-group "$resourceGroupName" \
    --plan "${appServiceName}-plan" \
    --runtime "NODE:22-lts" \
    --output json

echo "Enabling public network access for App Service..."
az webapp update \
    --name "$appServiceName" \
    --resource-group "$resourceGroupName" \
    --set publicNetworkAccess=Enabled \
    --output json

echo "Creating AI Services account: $aiServicesName..."
az cognitiveservices account create \
    --name "$aiServicesName" \
    --resource-group "$resourceGroupName" \
    --location "$location" \
    --sku "S0" \
    --kind "AIServices" \
    --public-network-access Enabled \
    --yes \
    --output json

echo "Storing AI service key and SQL endpoint in Key Vault..."
aiServicesKey=$(az cognitiveservices account keys list \
    --name "$aiServicesName" \
    --resource-group "$resourceGroupName" \
    --query "key1" -o tsv)
az keyvault secret set --vault-name "$keyVaultName" --name "ai-services-key" --value "$aiServicesKey" --output json

sqlEndpoint=$(az sql server show \
    --name "$dbName" \
    --resource-group "$resourceGroupName" \
    --query "fullyQualifiedDomainName" -o tsv)
az keyvault secret set --vault-name "$keyVaultName" --name "sql-endpoint" --value "$sqlEndpoint" --output json

echo "Assigning managed identity to App Service..."
az webapp identity assign \
    --name "$appServiceName" \
    --resource-group "$resourceGroupName" \
    --output json

principalId=$(az webapp identity show \
    --name "$appServiceName" \
    --resource-group "$resourceGroupName" \
    --query "principalId" -o tsv)

echo "Granting Key Vault access to managed identity..."
az keyvault set-policy \
    --name "$keyVaultName" \
    --resource-group "$resourceGroupName" \
    --object-id "$principalId" \
    --secret-permissions get list \
    --output json

echo "Setting up GitHub deployment source for App Service..."
az webapp deployment source config \
    --name "$appServiceName" \
    --resource-group "$resourceGroupName" \
    --repo-url "https://github.com/genregod/valor-assist" \
    --branch "main" \
    --manual-integration \
    --repository-type "GitHub" \
    --git-token "$github_token"
# --- Script execution starts here ---

# Define a unique log file name with a timestamp
LOG_FILE="deployment_log_$(date +%Y-%m-%d_%H-%M-%S).txt"
echo "Deployment output will be logged to: $LOG_FILE"
echo "--------------------------------------------------"

# Execute the main function, passing all script arguments to it.
# Redirect both standard output (stdout) and standard error (stderr) to the 'tee' command.
# 'tee' will simultaneously print to the console AND write to the specified log file.
main "$@" 2>&1 | tee "$LOG_FILE"

# Check the exit status of the main function in the pipe.
# This ensures that if the deployment fails, the script reports an error.
if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo "--------------------------------------------------"
    echo "Deployment failed. Please review the output above and check '$LOG_FILE' for the full log."
    exit 1
else
    echo "--------------------------------------------------"
    echo "Deployment log saved successfully to '$LOG_FILE'."
fi
# --- Final Output ---
echo "--------------------------------------------------"
echo "✅ Deployment and configuration complete!"
echo "App Service: $appServiceName"
echo "Key Vault: $keyVaultName"
echo "SQL Server: $dbName"
echo "AI Services: $aiServicesName"
echo "GitHub deployment: linked to main branch"
echo "--------------------------------------------------"