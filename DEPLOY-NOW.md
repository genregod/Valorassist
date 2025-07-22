# Quick Azure Deployment Guide

Follow these steps to deploy your Valor Assist application to Azure:

## Step 1: Commit Your Changes

```bash
git add -A
git commit -m "Fix Azure deployment: Update startup configuration for dist folder"
```

## Step 2: Login to Azure

```bash
az login --use-device-code
```

Follow the instructions to authenticate using the device code.

## Step 3: Build the Application

```bash
npm run build
```

## Step 4: Deploy to Azure

Run the deployment script:

```bash
./deploy-to-azure-now.sh
```

This script will:
- Build your application
- Create a deployment package
- Deploy to Azure Web App
- Configure the startup command
- Verify the deployment

## Alternative: Manual Deployment

If you prefer to deploy manually:

### 1. Create deployment package:
```bash
zip -r deploy.zip dist/ package.json package-lock.json web.config startup.sh ecosystem.config.js .deployment
```

### 2. Deploy the package:
```bash
az webapp deployment source config-zip \
  --resource-group valor-assist-rg \
  --name valor-assist-service \
  --src deploy.zip
```

### 3. Set startup command:
```bash
az webapp config set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --startup-file "./startup.sh"
```

### 4. Restart the app:
```bash
az webapp restart --name valor-assist-service --resource-group valor-assist-rg
```

## Verify Deployment

Check your application:
- URL: https://valor-assist-service.azurewebsites.net
- Health Check: https://valor-assist-service.azurewebsites.net/api/health

## Monitor Logs

```bash
az webapp log tail --name valor-assist-service --resource-group valor-assist-rg
```

## Troubleshooting

If the app doesn't start:

1. Check logs in Azure Portal
2. Verify the dist folder was deployed
3. Check environment variables are set
4. Try setting startup command to: `node dist/index.js`

The key fix we made was ensuring Azure looks for the application files in the `dist` folder instead of the root directory.