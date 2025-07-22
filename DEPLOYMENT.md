# Valor Assist - Azure Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying Valor Assist to Microsoft Azure using GitHub Actions.

## Prerequisites

- GitHub repository with the Valor Assist code
- Azure subscription
- Azure CLI installed locally (optional, for manual setup)
- Node.js 22.x for local development

## Quick Start

### 1. Fork/Clone Repository

```bash
git clone https://github.com/[your-username]/valor-assist.git
cd valor-assist
```

### 2. Set Up Azure Resources

#### Option A: Automated Setup (Recommended)
```bash
# Run the setup script
./scripts/azure-setup.sh
```

This script will:
- Create Resource Group in Southeast Asia
- Create App Service Plan (B1 tier)
- Create Web App with Node.js 20
- Create PostgreSQL database
- Configure all necessary settings
- Download publish profile

#### Option B: Manual Setup via Azure Portal

1. **Create Resource Group**
   - Name: `valor-assist-rg`
   - Region: Southeast Asia

2. **Create App Service Plan**
   - Name: `valor-assist-plan`
   - OS: Linux
   - Pricing Tier: B1 (Basic)

3. **Create Web App**
   - Name: `valor-assist` (must be globally unique)
   - Runtime: Node 22 LTS
   - Region: Same as resource group

4. **Create PostgreSQL Database**
   - Type: Azure Database for PostgreSQL - Flexible Server
   - Server name: `valor-assist-db`
   - Version: PostgreSQL 15
   - Compute: Burstable B1ms

### 3. Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Add the following secret:
   - **Name**: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - **Value**: Contents of the publish profile XML

### 4. Configure Azure App Settings

In Azure Portal, navigate to your Web App → Configuration → Application settings:

```
NODE_ENV=production
DATABASE_URL=postgresql://[username]:[password]@[server].postgres.database.azure.com:5432/valorassist?sslmode=require
OPENAI_API_KEY=your-openai-api-key
AZURE_COMMUNICATION_CONNECTION_STRING=your-azure-communication-connection-string
SESSION_SECRET=your-session-secret
```

### 5. Deploy

Push to the main branch to trigger automatic deployment:

```bash
git add .
git commit -m "Deploy to Azure"
git push origin main
```

## GitHub Actions Workflows

### Build and Deploy (`main_valor-assist-service.yml`)
- Triggers on push to `main` branch
- Builds the application
- Runs tests
- Deploys to Azure Web App using Azure login authentication

### Continuous Integration (`ci.yml`)
- Triggers on pull requests
- Runs linting, type checking, and tests
- Ensures code quality before merge

## Monitoring

### Health Check
- Production: `https://valor-assist.azurewebsites.net/api/health`
- Returns JSON with service status

### Azure Portal Monitoring
1. **Application Insights** (if configured)
   - Real-time metrics
   - Error tracking
   - Performance monitoring

2. **Log Stream**
   - Web App → Monitoring → Log stream
   - Real-time application logs

3. **Metrics**
   - HTTP requests
   - Response times
   - Error rates

## Troubleshooting

### Common Issues

1. **Deployment Fails**
   - Check GitHub Actions logs
   - Verify publish profile is correct
   - Ensure all secrets are set

2. **App Not Starting**
   - Check Log Stream in Azure Portal
   - Verify Node version is 22.x
   - Check startup command: `node dist/index.js`
   - Ensure dist folder is included in deployment
   - Use startup script: `./startup.sh` if needed

3. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check firewall rules allow Azure services
   - Ensure SSL mode is set to `require`

4. **API Keys Not Working**
   - Double-check App Settings in Azure
   - Restart the Web App after changing settings
   - Verify keys are valid and have proper permissions

### Rollback Procedure

1. **Via Azure Portal**
   - Web App → Deployment Center → Deployment slots
   - Swap with previous deployment

2. **Via GitHub**
   - Revert the commit
   - Push to trigger new deployment

## Performance Optimization

1. **Enable Application Insights**
   ```bash
   az monitor app-insights component create \
     --app valor-assist-insights \
     --location southeastasia \
     --resource-group valor-assist-rg
   ```

2. **Configure Autoscaling**
   - App Service Plan → Scale out
   - Set rules based on CPU/Memory usage

3. **Enable CDN for Static Assets**
   - Azure CDN can be configured for better global performance

## Security Best Practices

1. **Enable HTTPS Only**
   - Web App → Settings → TLS/SSL settings
   - HTTPS Only: On

2. **Configure CORS**
   - Only allow specific origins
   - Web App → API → CORS

3. **Use Key Vault for Secrets**
   ```bash
   az keyvault create \
     --name valor-assist-kv \
     --resource-group valor-assist-rg \
     --location southeastasia
   ```

4. **Enable Managed Identity**
   - Web App → Identity → System assigned: On
   - Grant access to Key Vault

## Cost Management

### Estimated Monthly Costs (Southeast Asia)
- App Service Plan (B1): ~$13/month
- PostgreSQL (B1ms): ~$25/month
- Application Insights: ~$5/month (depends on usage)
- **Total**: ~$43/month minimum

### Cost Optimization
1. Use Dev/Test pricing if eligible
2. Stop resources when not in use
3. Use Azure Cost Management for monitoring

## Support

### Resources
- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Node.js on Azure](https://docs.microsoft.com/azure/app-service/quickstart-nodejs)

### Getting Help
1. Check deployment logs in GitHub Actions
2. Review Azure Portal diagnostics
3. Check application logs in Log Stream
4. Contact Azure Support if needed