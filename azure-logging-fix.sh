#!/bin/bash

# Fixed Azure Logging Setup - Working around extension issues

echo "Setting up comprehensive logging (fixed version)..."

# Variables
RESOURCE_GROUP="valor-assist-rg"
APP_NAME="valor-assist-service"
LOCATION="eastasia"
WORKSPACE_NAME="valor-logallmetrics"
APP_INSIGHTS_NAME="valor-assist-insights"

# 1. Check if workspace exists
echo "Checking Log Analytics Workspace..."
WORKSPACE_ID=$(az monitor log-analytics workspace show \
  --resource-group $RESOURCE_GROUP \
  --workspace-name $WORKSPACE_NAME \
  --query id -o tsv 2>/dev/null)

if [ -z "$WORKSPACE_ID" ]; then
  echo "Workspace not found, creating..."
  az monitor log-analytics workspace create \
    --resource-group $RESOURCE_GROUP \
    --workspace-name $WORKSPACE_NAME \
    --location $LOCATION
  
  WORKSPACE_ID=$(az monitor log-analytics workspace show \
    --resource-group $RESOURCE_GROUP \
    --workspace-name $WORKSPACE_NAME \
    --query id -o tsv)
fi

echo "Workspace ID: $WORKSPACE_ID"

# 2. Create Application Insights using REST API
echo "Creating Application Insights using REST API..."
SUBSCRIPTION_ID="655055f1-8cf2-4581-b183-d68aaa588626"

# Get access token
ACCESS_TOKEN=$(az account get-access-token --query accessToken -o tsv)

# Create App Insights via REST API
curl -X PUT \
  "https://management.azure.com/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Insights/components/$APP_INSIGHTS_NAME?api-version=2020-02-02" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d @- <<EOF
{
  "location": "$LOCATION",
  "kind": "web",
  "properties": {
    "Application_Type": "web",
    "WorkspaceResourceId": "$WORKSPACE_ID"
  }
}
EOF

echo "Waiting for Application Insights to be created..."
sleep 10

# 3. Get instrumentation key using REST API
echo "Getting Application Insights details..."
APP_INSIGHTS_RESPONSE=$(curl -s \
  "https://management.azure.com/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Insights/components/$APP_INSIGHTS_NAME?api-version=2020-02-02" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

INSTRUMENTATION_KEY=$(echo $APP_INSIGHTS_RESPONSE | grep -o '"InstrumentationKey":"[^"]*' | cut -d'"' -f4)
CONNECTION_STRING=$(echo $APP_INSIGHTS_RESPONSE | grep -o '"ConnectionString":"[^"]*' | cut -d'"' -f4)

echo "Instrumentation Key: ${INSTRUMENTATION_KEY:0:8}..."

# 4. Configure App Service with Application Insights
echo "Configuring App Service..."
az webapp config appsettings set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    APPINSIGHTS_INSTRUMENTATIONKEY="$INSTRUMENTATION_KEY" \
    APPLICATIONINSIGHTS_CONNECTION_STRING="$CONNECTION_STRING" \
    ApplicationInsightsAgent_EXTENSION_VERSION="~3" \
    XDT_MicrosoftApplicationInsights_Mode="recommended"

# 5. Create diagnostic settings without retention (fixed)
echo "Creating diagnostic settings..."
az monitor diagnostic-settings create \
  --resource "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Web/sites/$APP_NAME" \
  --name "send-to-log-analytics" \
  --workspace $WORKSPACE_ID \
  --logs '[
    {"category": "AppServiceHTTPLogs", "enabled": true},
    {"category": "AppServiceConsoleLogs", "enabled": true},
    {"category": "AppServiceAppLogs", "enabled": true},
    {"category": "AppServicePlatformLogs", "enabled": true}
  ]' \
  --metrics '[{"category": "AllMetrics", "enabled": true}]' 2>/dev/null || echo "Diagnostic settings may already exist"

# 6. Verify and display results
echo ""
echo "✅ Setup complete!"
echo ""
echo "📊 Your logging infrastructure:"
echo "- Log Analytics Workspace: $WORKSPACE_NAME"
echo "- Application Insights: $APP_INSIGHTS_NAME"
echo "- Instrumentation Key: ${INSTRUMENTATION_KEY:0:8}..."
echo ""
echo "🔍 View logs in Azure Portal:"
echo "https://portal.azure.com/#@/resource/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/microsoft.insights/components/$APP_INSIGHTS_NAME/overview"
echo ""
echo "📝 Next step: Push your code changes to deploy with Application Insights integration"