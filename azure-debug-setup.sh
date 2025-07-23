#!/bin/bash

# Azure Debugging Setup Script

echo "Setting up comprehensive debugging for valor-assist-service..."

# 1. Enable detailed logging
echo "Enabling detailed application logging..."
az webapp log config --name valor-assist-service \
  --resource-group valor-assist-rg \
  --application-logging filesystem \
  --detailed-error-messages true \
  --failed-request-tracing true \
  --level verbose \
  --web-server-logging filesystem

# 2. Set environment variables for debugging
echo "Setting debug environment variables..."
az webapp config appsettings set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --settings \
    DEBUG="*" \
    NODE_ENV="development" \
    WEBSITE_DETAILED_ERROR_LOGGING="true" \
    WEBSITE_NODE_DEFAULT_VERSION="~22" \
    SCM_DO_BUILD_DURING_DEPLOYMENT="true" \
    WEBSITES_ENABLE_APP_SERVICE_STORAGE="true" \
    WEBSITE_RUN_FROM_PACKAGE="0"

# 3. Create Application Insights (if not exists)
echo "Setting up Application Insights..."
az monitor app-insights component create \
  --app valor-assist-insights \
  --location "East Asia" \
  --resource-group valor-assist-rg \
  --application-type "Node.JS" \
  --kind web || echo "Application Insights may already exist"

# 4. Get the instrumentation key
INSTRUMENTATION_KEY=$(az monitor app-insights component show \
  --app valor-assist-insights \
  --resource-group valor-assist-rg \
  --query instrumentationKey -o tsv)

# 5. Connect App Service to Application Insights
echo "Connecting to Application Insights..."
az webapp config appsettings set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --settings \
    APPINSIGHTS_INSTRUMENTATIONKEY="$INSTRUMENTATION_KEY" \
    ApplicationInsightsAgent_EXTENSION_VERSION="~3" \
    XDT_MicrosoftApplicationInsights_Mode="recommended"

# 6. Enable live stream
echo "Enabling live metrics stream..."
az webapp config appsettings set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --settings \
    APPINSIGHTS_QUICKPULSE_ENABLED="true"

echo "Debug setup complete!"
echo "You can now:"
echo "1. View logs: az webapp log tail --name valor-assist-service --resource-group valor-assist-rg"
echo "2. Download logs: az webapp log download --name valor-assist-service --resource-group valor-assist-rg"
echo "3. View in portal: https://portal.azure.com/#@/resource/subscriptions/655055f1-8cf2-4581-b183-d68aaa588626/resourceGroups/valor-assist-rg/providers/Microsoft.Web/sites/valor-assist-service/logStream"