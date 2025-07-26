# ValorAssist - VA Claims Support Platform

A comprehensive platform to help veterans navigate the VA claims process with AI-powered assistance.

## 🚀 Recent Updates

**DEPLOYMENT FIXED** ✅
- Fixed Azure deployment with correct server file handling
- Resolved ES module compatibility issues
- Build and deployment pipeline working correctly

**CHATBOT IMPROVEMENTS** 🤖
- Implemented fallback bot functionality for when Azure Communication Services is unavailable
- Bot now works without requiring external API keys for basic functionality
- Enhanced error handling and graceful degradation

## Features

- **Interactive Chatbot**: AI-powered assistant to help with VA claims questions
- **Claims Guidance**: Step-by-step assistance for filing claims
- **Appeals Support**: Information about appeals processes
- **Document Management**: Help with required documentation
- **Real-time Support**: Live chat support functionality

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **Deployment**: Azure App Service with GitHub Actions
- **AI**: OpenAI GPT-4o (optional) with fallback functionality
- **Chat**: Azure Communication Services (optional) with local fallback

## Environment Setup

The application works out of the box with fallback functionality. For enhanced features, configure:

```bash
# Optional - for AI-powered responses
OPENAI_API_KEY=your_openai_api_key

# Optional - for Azure Communication Services
AZURE_COMMUNICATION_CONNECTION_STRING=your_azure_connection_string
```

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Deployment Status

✅ **LIVE**: https://valor-assist-service.azurewebsites.net/

The application is successfully deployed and running on Azure App Service with automatic deployments via GitHub Actions.