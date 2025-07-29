#!/bin/bash

echo "=== Configuring Azure APIs for ValorAssist Chatbot ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

RESOURCE_GROUP="valor-assist-rg"
APP_NAME="valor-assist-service"
AI_SERVICE_NAME="valor-assist-ai"
COMM_SERVICE_NAME="VA-Comm_Sev"
SQL_SERVER_NAME="valor-assist-db"  # Assuming this is your SQL server name

# Check Azure login
if ! az account show &>/dev/null; then
    echo -e "${RED}Please login to Azure first:${NC}"
    echo "az login --use-device-code"
    exit 1
fi

echo -e "${YELLOW}1. Getting Azure Communication Services connection string...${NC}"
# Get Azure Communication Services connection string
AZURE_COMM_STRING=$(az communication list-key \
  --name $COMM_SERVICE_NAME \
  --resource-group $RESOURCE_GROUP \
  --query primaryConnectionString -o tsv 2>/dev/null || echo "")

if [ -z "$AZURE_COMM_STRING" ]; then
    echo -e "${RED}   Azure Communication Services not found or inaccessible.${NC}"
    echo -e "${YELLOW}   Creating Azure Communication Services...${NC}"
    
    az communication create \
      --name $COMM_SERVICE_NAME \
      --resource-group $RESOURCE_GROUP \
      --location global \
      --data-location eastasia || echo "Communication service may already exist"
    
    # Try again to get the connection string
    AZURE_COMM_STRING=$(az communication list-key \
      --name $COMM_SERVICE_NAME \
      --resource-group $RESOURCE_GROUP \
      --query primaryConnectionString -o tsv 2>/dev/null || echo "")
fi

if [ -n "$AZURE_COMM_STRING" ]; then
    echo -e "${GREEN}   ✓ Azure Communication Services connection string retrieved${NC}"
else
    echo -e "${RED}   ✗ Could not get Azure Communication Services connection string${NC}"
fi

echo ""
echo -e "${YELLOW}2. Getting Azure AI Services key...${NC}"
# Get Azure AI Services key
AI_SERVICE_KEY=$(az cognitiveservices account keys list \
  --name $AI_SERVICE_NAME \
  --resource-group $RESOURCE_GROUP \
  --query key1 -o tsv 2>/dev/null || echo "")

if [ -z "$AI_SERVICE_KEY" ]; then
    echo -e "${RED}   Azure AI Services not found or inaccessible.${NC}"
    echo -e "${YELLOW}   Creating Azure AI Services...${NC}"
    
    az cognitiveservices account create \
      --name $AI_SERVICE_NAME \
      --resource-group $RESOURCE_GROUP \
      --kind CognitiveServices \
      --sku S0 \
      --location eastasia \
      --yes || echo "AI service may already exist"
    
    # Try again to get the key
    AI_SERVICE_KEY=$(az cognitiveservices account keys list \
      --name $AI_SERVICE_NAME \
      --resource-group $RESOURCE_GROUP \
      --query key1 -o tsv 2>/dev/null || echo "")
fi

if [ -n "$AI_SERVICE_KEY" ]; then
    echo -e "${GREEN}   ✓ Azure AI Services key retrieved${NC}"
else
    echo -e "${RED}   ✗ Could not get Azure AI Services key${NC}"
fi

echo ""
echo -e "${YELLOW}3. Getting SQL Server connection details...${NC}"
# Get SQL Server connection details
SQL_SERVER_HOST=$(az sql server show \
  --name $SQL_SERVER_NAME \
  --resource-group $RESOURCE_GROUP \
  --query fullyQualifiedDomainName -o tsv 2>/dev/null || echo "")

if [ -n "$SQL_SERVER_HOST" ]; then
    echo -e "${GREEN}   ✓ SQL Server found: $SQL_SERVER_HOST${NC}"
    # Construct DATABASE_URL (you'll need to provide the password)
    echo -e "${YELLOW}   Note: You'll need to provide the SQL password for DATABASE_URL${NC}"
else
    echo -e "${RED}   ✗ Could not find SQL Server${NC}"
fi

echo ""
echo -e "${YELLOW}4. Prompting for OpenAI API Key (optional but recommended)...${NC}"
echo -e "${GREEN}For enhanced AI responses, please provide your OpenAI API Key.${NC}"
echo -e "${GREEN}You can get one from: https://platform.openai.com/api-keys${NC}"
echo -e "${GREEN}Or press Enter to skip and use Azure AI Services only.${NC}"
read -p "Enter OpenAI API Key (optional): " OPENAI_API_KEY

echo ""
echo -e "${YELLOW}5. Configuring App Service environment variables...${NC}"

# Prepare settings array
SETTINGS=()
SETTINGS+=("NODE_ENV=production")

if [ -n "$AZURE_COMM_STRING" ]; then
    SETTINGS+=("AZURE_COMMUNICATION_CONNECTION_STRING=$AZURE_COMM_STRING")
fi

if [ -n "$OPENAI_API_KEY" ]; then
    SETTINGS+=("OPENAI_API_KEY=$OPENAI_API_KEY")
fi

if [ -n "$AI_SERVICE_KEY" ]; then
    SETTINGS+=("AZURE_AI_SERVICES_KEY=$AI_SERVICE_KEY")
fi

# Generate session secret if not provided
SESSION_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "fallback-session-secret-$(date +%s)")
SETTINGS+=("SESSION_SECRET=$SESSION_SECRET")

if [ -n "$SQL_SERVER_HOST" ]; then
    echo -e "${YELLOW}   For DATABASE_URL, please provide SQL admin password:${NC}"
    read -s -p "   SQL Admin Password: " SQL_PASSWORD
    echo ""
    if [ -n "$SQL_PASSWORD" ]; then
        DATABASE_URL="postgresql://valoradmin:$SQL_PASSWORD@$SQL_SERVER_HOST:5432/valorassist?sslmode=require"
        SETTINGS+=("DATABASE_URL=$DATABASE_URL")
    fi
fi

# Apply settings to App Service
echo -e "${YELLOW}   Applying settings to App Service...${NC}"
az webapp config appsettings set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings "${SETTINGS[@]}" \
  --output table

echo ""
echo -e "${YELLOW}6. Restarting App Service...${NC}"
az webapp restart --name $APP_NAME --resource-group $RESOURCE_GROUP

echo ""
echo -e "${GREEN}=== Configuration Complete! ===${NC}"
echo ""
echo -e "${GREEN}✅ Your chatbot should now be working with:${NC}"
if [ -n "$AZURE_COMM_STRING" ]; then
    echo -e "${GREEN}   ✓ Azure Communication Services${NC}"
fi
if [ -n "$OPENAI_API_KEY" ]; then
    echo -e "${GREEN}   ✓ OpenAI API (enhanced responses)${NC}"
fi
if [ -n "$AI_SERVICE_KEY" ]; then
    echo -e "${GREEN}   ✓ Azure AI Services${NC}"
fi
if [ -n "$SQL_SERVER_HOST" ]; then
    echo -e "${GREEN}   ✓ Azure SQL Database${NC}"
fi

echo ""
echo -e "${GREEN}🌐 Test your chatbot at: https://valor-assist-service.azurewebsites.net${NC}"
echo ""
echo -e "${YELLOW}📊 Monitor logs with:${NC}"
echo "az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP"
