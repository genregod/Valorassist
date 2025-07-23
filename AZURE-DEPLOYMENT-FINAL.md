# Azure Deployment - Final Solution

## Root Cause Analysis
Azure App Service runs `npm install --production` at runtime, which excludes devDependencies. Our bundled dist/index.js had imports to Vite packages (@vitejs/plugin-react) that are devDependencies.

## Solution Implemented
Created a simplified `server.js` that:
- Uses CommonJS (no ESM imports)
- Only depends on Express (a production dependency)
- Serves the built React app from dist/public
- Listens on port 8080 as Azure requires

## Deployment Steps

### 1. Ensure App Settings are Correct
```bash
az webapp config appsettings set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --settings \
    SCM_DO_BUILD_DURING_DEPLOYMENT="true" \
    WEBSITE_NODE_DEFAULT_VERSION="~22" \
    PORT="8080"
```

### 2. Set Startup Command
```bash
az webapp config set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --startup-file "node server.js"
```

### 3. Push Changes to GitHub
```bash
git add .
git commit -m "Fix: Azure deployment - simplified server.js for production"
git push origin main
```

### 4. Monitor Deployment
- GitHub Actions: Check the workflow runs
- Azure Logs: https://valor-assist-service.scm.azurewebsites.net/api/logstream
- Live Site: https://valor-assist-service.azurewebsites.net

## Why This Works
1. **No Vite Dependencies**: server.js only uses Express (production dependency)
2. **Proper Port**: Listens on 8080 as Azure expects
3. **Simple Static Serving**: Serves built React files without complex imports
4. **Microsoft Best Practices**: Follows official recommendations

## Alternative: PM2 (Optional)
Microsoft recommends PM2 for production. If needed:
```bash
az webapp config set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --startup-file "pm2 start server.js --no-daemon"
```

## Verification
Once deployed, the app should:
- Start without module errors
- Serve the React app correctly
- Respond to health checks on port 8080
- Show no ERR_MODULE_NOT_FOUND errors