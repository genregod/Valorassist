#!/bin/bash

echo "=== Azure Runtime Diagnostics ==="
echo ""

# Check if the deployment has our server.js
echo "1. Checking if server.js exists in deployment..."
az webapp ssh --name valor-assist-service --resource-group valor-assist-rg --command "ls -la /home/site/wwwroot/server.js" 2>/dev/null || echo "SSH access not available"

# Check what's in the root directory
echo -e "\n2. Root directory contents:"
az webapp ssh --name valor-assist-service --resource-group valor-assist-rg --command "ls -la /home/site/wwwroot/ | head -20" 2>/dev/null || echo "Cannot list directory"

# Check the actual startup command being used
echo -e "\n3. Current startup command:"
az webapp config show --name valor-assist-service --resource-group valor-assist-rg --query "appCommandLine" -o tsv

# Check Node.js version
echo -e "\n4. Node.js version configured:"
az webapp config show --name valor-assist-service --resource-group valor-assist-rg --query "linuxFxVersion" -o tsv

# Test the health endpoint
echo -e "\n5. Testing health endpoint:"
curl -s -w "\nHTTP Status: %{http_code}\n" https://valor-assist-service.azurewebsites.net/health | head -20

echo -e "\n=== End Diagnostics ==="