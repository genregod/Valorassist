#!/bin/bash

echo "🔍 Checking Valor Assist deployment status..."

# Get app status
echo -e "\n📱 App Service Status:"
az webapp show --name valor-assist-service --resource-group valor-assist-rg --query "[state, defaultHostName, kind]" -o table 2>/dev/null || echo "Failed to get app status"

# Check deployment history
echo -e "\n📦 Recent Deployments:"
az webapp deployment list --name valor-assist-service --resource-group valor-assist-rg --query "[0:3].[id, author, message, endTime, status]" -o table 2>/dev/null || echo "No deployment history"

# Get app settings (without values)
echo -e "\n⚙️  Configured App Settings:"
az webapp config appsettings list --name valor-assist-service --resource-group valor-assist-rg --query "[].name" -o tsv 2>/dev/null | sort

# Check if startup command is set
echo -e "\n🚀 Startup Command:"
az webapp config show --name valor-assist-service --resource-group valor-assist-rg --query "linuxFxVersion" -o tsv 2>/dev/null

# Download recent logs
echo -e "\n📝 Downloading recent logs..."
az webapp log download --name valor-assist-service --resource-group valor-assist-rg --log-file valor-logs.zip 2>/dev/null && {
    echo "Logs downloaded to valor-logs.zip"
    unzip -l valor-logs.zip | head -20
} || echo "Failed to download logs"

# Check container status via REST API
echo -e "\n🐳 Checking container status..."
curl -s "https://valor-assist-service.scm.azurewebsites.net/api/logstream/application" 2>/dev/null | head -50 || echo "Could not access log stream"

echo -e "\n✅ Diagnostics complete. Check valor-logs.zip for detailed logs."