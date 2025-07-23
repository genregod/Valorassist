#!/bin/bash

echo "=== Azure Quick Fix - Install Dependencies ==="

# Set the startup command to install dependencies first
az webapp config set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --startup-file "cd /home/site/wwwroot && npm install --production && node dist/index.js"

# Restart the app
az webapp restart --name valor-assist-service --resource-group valor-assist-rg

echo "Fix applied! The app will install dependencies and start."
echo "Check logs at: https://valor-assist-service.scm.azurewebsites.net/api/logs/docker"