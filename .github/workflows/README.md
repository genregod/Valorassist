# GitHub Actions Workflows for Azure Deployment

This directory contains GitHub Actions workflows for building and deploying Valor Assist to Azure.

## Workflows

### 1. `main_valor-assist-service.yml` - Build and Deploy to Azure
- **Trigger**: Push to `main` branch or manual workflow dispatch
- **Purpose**: Build the application and deploy to Azure Web App
- **Steps**:
  1. Checkout code
  2. Setup Node.js 20.x
  3. Install dependencies
  4. Build application
  5. Run tests (if available)
  6. Zip and upload artifacts
  7. Login to Azure using service principal
  8. Deploy to Azure Web App

### 2. `ci.yml` - Continuous Integration
- **Trigger**: Pull requests to `main` or `develop`, pushes to `develop`
- **Purpose**: Run tests and quality checks
- **Steps**:
  1. Setup PostgreSQL test database
  2. Run linting
  3. Run type checking
  4. Run tests
  5. Build application
  6. Upload coverage reports

## Required Secrets

Configure these secrets in your GitHub repository settings:

### For Azure Deployment (`main_valor-assist-service.yml`):
- `AZUREAPPSERVICE_CLIENTID_VALOR`: Azure Service Principal Client ID
- `AZUREAPPSERVICE_TENANTID_VALOR`: Azure Tenant ID
- `AZUREAPPSERVICE_SUBSCRIPTIONID_VALOR`: Azure Subscription ID

To create these secrets:
1. Create an Azure Service Principal:
   ```bash
   az ad sp create-for-rbac --name "valor-assist-github" --role contributor \
     --scopes /subscriptions/{subscription-id}/resourceGroups/valor-assist-rg \
     --sdk-auth
   ```
2. Extract the clientId, tenantId, and subscriptionId from the output
3. Add them as GitHub secrets

### Optional Environment Variables:
- `VITE_API_URL`: API URL for frontend (defaults to production URL)

## Azure Configuration

### Required App Settings in Azure:
```
NODE_ENV=production
OPENAI_API_KEY=<your-key>
AZURE_COMMUNICATION_CONNECTION_STRING=<your-connection-string>
DATABASE_URL=<your-database-url>
SESSION_SECRET=<your-secret>
```

### Azure Web App Configuration:
1. **Runtime Stack**: Node 20 LTS
2. **Platform**: Linux or Windows
3. **Region**: Southeast Asia (or your preferred region)
4. **App Service Plan**: B1 or higher for production

## Setup Instructions

1. **Create Azure Resources**:
   ```bash
   # Login to Azure
   az login
   
   # Create resource group
   az group create --name valor-assist-rg --location southeastasia
   
   # Create App Service Plan
   az appservice plan create \
     --name valor-assist-plan \
     --resource-group valor-assist-rg \
     --sku B1 \
     --is-linux
   
   # Create Web App
   az webapp create \
     --name valor-assist \
     --resource-group valor-assist-rg \
     --plan valor-assist-plan \
     --runtime "NODE:20-lts"
   ```

2. **Configure GitHub Secrets**:
   - Go to GitHub repository → Settings → Secrets and variables → Actions
   - Add `AZURE_WEBAPP_PUBLISH_PROFILE` secret

3. **Push to Main Branch**:
   - The workflow will automatically trigger and deploy to Azure

## Monitoring

- Check workflow runs in GitHub Actions tab
- Monitor deployment in Azure Portal
- View logs in Azure App Service → Log stream

## Rollback

If deployment fails:
1. Check GitHub Actions logs for errors
2. Use Azure Portal to revert to previous deployment slot
3. Or manually deploy previous version using Azure CLI