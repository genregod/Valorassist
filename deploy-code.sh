#!/bin/bash

# This script builds and deploys the application CODE to an existing Azure App Service.
# It now logs all output to a file named 'code_deployment_log_[timestamp].txt'.
#
# Usage:
# ./deploy-code.sh <RESOURCE_GROUP_NAME> <APP_SERVICE_NAME>

# --- Main deployment logic is wrapped in a function to capture its output ---
main() {
    set -e # Exit immediately if a command exits with a non-zero status.

    # 1. Check for required arguments
    if [ -z "$1" ] || [ -z "$2" ]; then
      echo "Error: Missing required arguments."
      echo "Usage: $0 <RESOURCE_GROUP_NAME> <APP_SERVICE_NAME>"
      exit 1
    fi

    RESOURCE_GROUP=$1
    APP_NAME=$2
    ZIP_NAME="valorassist-deploy.zip"

    echo "Starting CODE deployment to App Service '$APP_NAME' in resource group '$RESOURCE_GROUP'..."

    # 2. Install dependencies
    echo "Step 1/4: Installing npm dependencies..."
    npm install

    # 3. Build the application (client and server)
    echo "Step 2/4: Building the application for production..."
    npm run build

    # 4. Create a deployment package (zip file)
    echo "Step 3/4: Creating deployment package '$ZIP_NAME'..."
    rm -f $ZIP_NAME
    zip -r $ZIP_NAME dist node_modules package.json package-lock.json

    # 5. Deploy to Azure App Service
    echo "Step 4/4: Deploying to Azure..."
    az webapp deploy --resource-group $RESOURCE_GROUP --name $APP_NAME --src-path $ZIP_NAME --type zip --output json

    echo "Deployment complete!"
    echo "Your application should be available at: https://$APP_NAME.azurewebsites.net"

    rm $ZIP_NAME
}

# --- Script execution starts here ---

# Define a unique log file name with a timestamp
LOG_FILE="code_deployment_log_$(date +%Y-%m-%d_%H-%M-%S).txt"
echo "Deployment output will be logged to: $LOG_FILE"
echo "--------------------------------------------------"

# Execute the main function, passing all script arguments to it.
# 'tee' will simultaneously print to the console AND write to the specified log file.
main "$@" 2>&1 | tee "$LOG_FILE"

# Check the exit status of the main function in the pipe.
if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo "--------------------------------------------------"
    echo "Deployment failed. Please review the output above and check '$LOG_FILE' for the full log."
    exit 1
else
    echo "--------------------------------------------------"
    echo "Deployment log saved successfully to '$LOG_FILE'."