#!/bin/bash

# Azure Comprehensive Logging Setup for Valor Assist

echo "Setting up comprehensive logging and metrics for valor-assist-service..."

# Variables
RESOURCE_GROUP="valor-assist-rg"
APP_NAME="valor-assist-service"
LOCATION="East Asia"
WORKSPACE_NAME="valor-logallmetrics"
APP_INSIGHTS_NAME="valor-assist-insights"

# 1. Create Log Analytics Workspace (if not exists)
echo "Creating Log Analytics Workspace..."
az monitor log-analytics workspace create \
  --resource-group $RESOURCE_GROUP \
  --workspace-name $WORKSPACE_NAME \
  --location "$LOCATION" || echo "Workspace may already exist"

# Get workspace ID
WORKSPACE_ID=$(az monitor log-analytics workspace show \
  --resource-group $RESOURCE_GROUP \
  --workspace-name $WORKSPACE_NAME \
  --query id -o tsv)

# 2. Create Application Insights connected to Log Analytics
echo "Creating Application Insights with Log Analytics integration..."
az monitor app-insights component create \
  --app $APP_INSIGHTS_NAME \
  --location "$LOCATION" \
  --resource-group $RESOURCE_GROUP \
  --application-type "Node.JS" \
  --kind web \
  --workspace $WORKSPACE_ID || echo "App Insights may already exist"

# Get instrumentation key and connection string
INSTRUMENTATION_KEY=$(az monitor app-insights component show \
  --app $APP_INSIGHTS_NAME \
  --resource-group $RESOURCE_GROUP \
  --query instrumentationKey -o tsv)

CONNECTION_STRING=$(az monitor app-insights component show \
  --app $APP_INSIGHTS_NAME \
  --resource-group $RESOURCE_GROUP \
  --query connectionString -o tsv)

# 3. Configure App Service with Application Insights
echo "Configuring App Service with Application Insights..."
az webapp config appsettings set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    APPINSIGHTS_INSTRUMENTATIONKEY="$INSTRUMENTATION_KEY" \
    APPLICATIONINSIGHTS_CONNECTION_STRING="$CONNECTION_STRING" \
    ApplicationInsightsAgent_EXTENSION_VERSION="~3" \
    XDT_MicrosoftApplicationInsights_Mode="recommended" \
    APPINSIGHTS_PROFILERFEATURE_VERSION="1.0.0" \
    APPINSIGHTS_SNAPSHOTFEATURE_VERSION="1.0.0" \
    DiagnosticServices_EXTENSION_VERSION="~3" \
    InstrumentationEngine_EXTENSION_VERSION="disabled" \
    SnapshotDebugger_EXTENSION_VERSION="disabled" \
    XDT_MicrosoftApplicationInsights_BaseExtensions="disabled" \
    XDT_MicrosoftApplicationInsights_PreemptSdk="disabled"

# 4. Enable all diagnostic settings
echo "Configuring diagnostic settings..."
az monitor diagnostic-settings create \
  --resource $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --resource-type "Microsoft.Web/sites" \
  --name "send-to-log-analytics" \
  --workspace $WORKSPACE_ID \
  --logs '[
    {
      "category": "AppServiceHTTPLogs",
      "enabled": true,
      "retentionPolicy": {
        "enabled": true,
        "days": 30
      }
    },
    {
      "category": "AppServiceConsoleLogs",
      "enabled": true,
      "retentionPolicy": {
        "enabled": true,
        "days": 30
      }
    },
    {
      "category": "AppServiceAppLogs",
      "enabled": true,
      "retentionPolicy": {
        "enabled": true,
        "days": 30
      }
    },
    {
      "category": "AppServiceAuditLogs",
      "enabled": true,
      "retentionPolicy": {
        "enabled": true,
        "days": 30
      }
    },
    {
      "category": "AppServiceIPSecAuditLogs",
      "enabled": true,
      "retentionPolicy": {
        "enabled": true,
        "days": 30
      }
    },
    {
      "category": "AppServicePlatformLogs",
      "enabled": true,
      "retentionPolicy": {
        "enabled": true,
        "days": 30
      }
    }
  ]' \
  --metrics '[
    {
      "category": "AllMetrics",
      "enabled": true,
      "retentionPolicy": {
        "enabled": true,
        "days": 30
      }
    }
  ]'

# 5. Enable verbose logging at App Service level
echo "Enabling verbose application logging..."
az webapp log config --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --application-logging filesystem \
  --detailed-error-messages true \
  --failed-request-tracing true \
  --level verbose \
  --web-server-logging filesystem

# 6. Set additional debugging environment variables
echo "Setting verbose logging environment variables..."
az webapp config appsettings set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    WEBSITE_DETAILED_ERROR_LOGGING="true" \
    WEBSITE_FAILED_REQUEST_TRACING="true" \
    DEBUG="*" \
    NODE_OPTIONS="--trace-warnings" \
    VERBOSE_LOGGING="true"

echo "✅ Logging setup complete!"
echo ""
echo "📊 Access your logs and metrics:"
echo "1. Application Insights: https://portal.azure.com/#@/resource/subscriptions/655055f1-8cf2-4581-b183-d68aaa588626/resourceGroups/$RESOURCE_GROUP/providers/microsoft.insights/components/$APP_INSIGHTS_NAME/overview"
echo "2. Log Analytics: https://portal.azure.com/#@/resource/subscriptions/655055f1-8cf2-4581-b183-d68aaa588626/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.OperationalInsights/workspaces/$WORKSPACE_NAME/overview"
echo "3. Live Metrics: https://portal.azure.com/#@/resource/subscriptions/655055f1-8cf2-4581-b183-d68aaa588626/resourceGroups/$RESOURCE_GROUP/providers/microsoft.insights/components/$APP_INSIGHTS_NAME/quickPulse"
echo ""
echo "🔍 Query logs using KQL:"
echo "az monitor log-analytics query --workspace $WORKSPACE_ID --analytics-query 'AppServiceConsoleLogs | take 100'"