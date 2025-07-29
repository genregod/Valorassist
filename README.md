# ValorAssist - VA Claims Support Platform

A comprehensive platform to help veterans navigate the VA claims process with AI-powered assistance.

## 🚀 Recent Updates

**AZURE OPENAI INTEGRATION** ✅ (Latest)
- Integrated fine-tuned Azure OpenAI gpt-4.1-nano model specialized for VA claims assistance
- Replaced generic OpenAI with domain-specific fine-tuned model "1-nano-2025-04-14-qa_frstrun"
- Enhanced chatbot responses with VA-specific knowledge and improved accuracy
- Maintained fallback functionality for robust service availability
- **STATUS**: Ready for deployment with enhanced VA expertise

**ROUTING FIXED** ✅
- Fixed Azure IIS routing configuration for API endpoints
- Updated web.config to properly direct `/api/*` requests to Node.js server
- Chatbot endpoints should now return JSON responses instead of HTML
- **STATUS**: Ready for testing

**DEPLOYMENT FIXED** ✅
- Fixed Azure deployment with correct server file handling
- Resolved ES module compatibility issues
- Build and deployment pipeline working correctly
- **CRITICAL FIX**: Now deploying the correct compiled server with API routes

**CHATBOT IMPROVEMENTS** 🤖
- Implemented fallback bot functionality for when Azure Communication Services is unavailable
- Bot now works without requiring external API keys for basic functionality
- Enhanced error handling and graceful degradation
- **FIXED 404 ERROR**: Corrected server deployment to include all API endpoints

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
- **AI**: Fine-tuned Azure OpenAI gpt-4.1-nano model (primary) with OpenAI GPT-4o fallback
- **Chat**: Azure Communication Services (optional) with local fallback

## Testing the Chatbot

The chatbot should now be fully functional:
- **Endpoint**: `POST /api/chat/bot/thread-001/process`
- **Test Payload**: `{"message": "Hello, I need help with my VA claim"}`
- **Expected**: JSON response with bot assistance, not HTML

## Environment Setup

The application works out of the box with fallback functionality. For enhanced features, configure:

```bash
# Primary AI - Fine-tuned Azure OpenAI (Recommended)
AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_ENDPOINT=https://eastus2.api.cognitive.microsoft.com/
AZURE_OPENAI_DEPLOYMENT_ID=1-nano-2025-04-14-qa_frstrun
AZURE_OPENAI_API_VERSION=2024-04-01-preview

# Fallback AI - Generic OpenAI (Optional)
OPENAI_API_KEY=your_openai_api_key

# Optional - for Azure Communication Services
AZURE_COMMUNICATION_CONNECTION_STRING=your_azure_connection_string
```

**Note**: The fine-tuned Azure OpenAI model provides significantly better responses for VA-specific questions and claims assistance.

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