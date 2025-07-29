#!/bin/bash

echo "=== Quick Chatbot Configuration ==="

# Get Azure Communication Services connection string
echo "Getting communication services key..."
COMM_STRING=$(az communication list-key --name "VA-Comm-Sev" --resource-group valor-assist-rg --query primaryConnectionString -o tsv 2>/dev/null)

# Get AI Services key
echo "Getting AI services key..."
AI_KEY=$(az cognitiveservices account keys list --name "valor-assist-ai" --resource-group valor-assist-rg --query key1 -o tsv 2>/dev/null)

echo "Configuring app..."
az webapp config appsettings set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --settings \
    NODE_ENV=production \
    AZURE_COMMUNICATION_CONNECTION_STRING="$COMM_STRING" \
    AZURE_AI_SERVICES_KEY="$AI_KEY" \
    SESSION_SECRET="$(openssl rand -base64 32)" \
  --output none

echo "Restarting app..."
az webapp restart --name valor-assist-service --resource-group valor-assist-rg --output none

echo "✅ Done! Test at: https://valor-assist-service.azurewebsites.net"