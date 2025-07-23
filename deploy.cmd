@echo off
echo Deployment script for Valor Assist

:: 1. Install production dependencies
echo Installing production dependencies...
call npm ci --production

:: 2. Check if dist folder exists
IF NOT EXIST "dist" (
    echo ERROR: dist folder not found! Build may have failed.
    exit /b 1
)

:: 3. Set startup command
echo Setting startup command...
echo node dist/index.js > .deployment

echo Deployment completed successfully!