# ValorAssist Azure Deployment - Complete Fix Guide

## Root Cause Analysis

Your Azure deployment has several interconnected issues:

### 1. **Module Resolution Errors** (Primary Issue)
- **Error**: `Cannot find package '@vitejs/plugin-react' imported from /home/site/wwwroot/dist/index.js`
- **Cause**: Azure runs `npm install --production` which excludes devDependencies, but your bundled dist/index.js imports Vite packages
- **Solution**: Use a simplified server.js that only uses production dependencies

### 2. **Port Configuration Problem**
- **Error**: Application Error in browser
- **Cause**: App configured for port 5001, Azure expects port 8080
- **Solution**: Updated server.js to use PORT environment variable (defaults to 8080)

### 3. **Build Configuration Issues**
- **Error**: "Could not resolve entry module 'index.html'"
- **Cause**: Vite configuration and build process issues
- **Solution**: Proper .deployment file and build scripts

## Complete Solution

### Step 1: Apply the Azure Configuration Fix

Run this command to configure Azure properly:

```bash
# Set Node.js version and startup command
az webapp config set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --linux-fx-version "NODE|22-lts" \
  --startup-file "node server.js"

# Set environment variables
az webapp config appsettings set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --settings \
    PORT="8080" \
    NODE_ENV="production" \
    WEBSITE_NODE_DEFAULT_VERSION="~22" \
    SCM_DO_BUILD_DURING_DEPLOYMENT="true" \
    WEBSITE_RUN_FROM_PACKAGE="0"

# Restart the app
az webapp restart --name valor-assist-service --resource-group valor-assist-rg
```

### Step 2: Verify the Fix

After running the commands above, wait 2-3 minutes and check:

1. **Main App**: https://valor-assist-service.azurewebsites.net
2. **Health Check**: https://valor-assist-service.azurewebsites.net/health
3. **API Health**: https://valor-assist-service.azurewebsites.net/api/health

### Step 3: Monitor Logs (if needed)

If the app still doesn't work, check the logs:
- **Azure Portal**: App Service → Monitoring → Log stream
- **Direct Logs**: https://valor-assist-service.scm.azurewebsites.net/api/logs/docker

## What Was Fixed

✅ **Module Dependencies**: server.js uses only Express (production dependency)  
✅ **Port Configuration**: Now uses port 8080 as Azure expects  
✅ **Node.js Version**: Set to Node.js 22 LTS  
✅ **Build Process**: Proper deployment configuration  
✅ **Static File Serving**: Correct path resolution for React app  
✅ **Health Endpoints**: Multiple endpoints for monitoring  

## Files Created/Updated

- `server.js` - Simplified server using only production dependencies
- `.deployment` - Azure deployment configuration
- `deploy.sh` - Build script for Azure
- `startup.sh` - Application startup script

## Expected Behavior

After applying the fix:
1. **Build Phase**: Azure will run `npm install` and `npm run build`
2. **Start Phase**: Azure will execute `node server.js`
3. **Runtime**: App serves React frontend on port 8080
4. **Health Checks**: `/health` and `/api/health` endpoints respond

## Troubleshooting

If the app still shows "Application Error":

1. **Check Azure Logs**: Look for specific error messages
2. **Verify Node Version**: Ensure it's using Node.js 22
3. **Check Build Output**: Verify dist/public directory exists
4. **Test Health Endpoint**: Should respond even if main app fails

## Additional Notes

- The new server.js is much simpler and avoids all Vite-related imports
- Uses CommonJS (require) instead of ESM imports for maximum compatibility
- Includes comprehensive logging for easier debugging
- Properly handles Azure's expected port and startup behavior

Your app should now deploy and run successfully on Azure!
