# Valor Assist - Azure Deployment Guide

This guide provides comprehensive instructions for deploying the Valor Assist platform to Microsoft Azure, focusing on secure data storage in Asia region, chat support integration, document analysis, and VA API integration.

## Prerequisites

- Azure account with active subscription
- Azure CLI installed and configured
- Node.js 20.x installed
- jq command-line tool installed (for parsing JSON)
- Git installed

## Deployment Overview

Our deployment consists of these Azure resources:

1. **Resource Group**: Centralized management for all Valor Assist resources
2. **Azure PostgreSQL Database**: Secure data storage in Asia region
3. **Azure App Service**: Hosting the Node.js application
4. **Azure API Management**: Managing API endpoints and integrations
5. **Azure Cognitive Services**: AI capabilities for document analysis
6. **Azure Key Vault**: Secure secret storage

## Configuration Files

Two key configuration files are included:

1. `azure-deploy.json`: Main configuration for Azure resources
2. `deploy-to-azure.sh`: Automated deployment script

## Deployment Steps

### 1. Automated Deployment

The fastest way to deploy is using our automated script:

```bash
# Make the script executable
chmod +x deploy-to-azure.sh

# Run the deployment script
./deploy-to-azure.sh
```

The script will:
- Create all necessary Azure resources
- Configure databases and services
- Set up initial configurations
- Generate and save credentials

### 2. Manual Resource Setup

If you prefer manual setup, follow these steps:

#### Resource Group Creation

```bash
az group create --name valor-assist-rg --location eastasia
```

#### Database Setup in Asia Region

```bash
# Create PostgreSQL server
az postgres server create \
  --resource-group valor-assist-rg \
  --name valor-assist-db \
  --location eastasia \
  --admin-user valoradmin \
  --admin-password <secure-password> \
  --sku-name GP_Gen5_2 \
  --version 14

# Create database
az postgres db create \
  --resource-group valor-assist-rg \
  --server-name valor-assist-db \
  --name valorassist

# Configure firewall
az postgres server firewall-rule create \
  --resource-group valor-assist-rg \
  --server-name valor-assist-db \
  --name AllowAllAzureIPs \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

#### App Service Setup

```bash
# Create App Service Plan
az appservice plan create \
  --name valor-assist-plan \
  --resource-group valor-assist-rg \
  --location eastasia \
  --sku B1

# Create App Service
az webapp create \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --plan valor-assist-plan \
  --runtime "NODE:20-lts"
```

#### API Management Setup

```bash
# Create API Management
az apim create \
  --name valor-assist-apim \
  --resource-group valor-assist-rg \
  --publisher-email admin@valorassist.com \
  --publisher-name "Valor Assist" \
  --sku-name Developer \
  --sku-capacity 1 \
  --location eastasia
```

#### AI Services Setup

```bash
# Create Cognitive Services
az cognitiveservices account create \
  --name valor-assist-ai \
  --resource-group valor-assist-rg \
  --kind CognitiveServices \
  --sku S0 \
  --location eastasia
```

## Application Configuration

### Environment Variables

Configure these environment variables in the App Service:

```bash
az webapp config appsettings set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --settings \
    DATABASE_URL="postgres://<username>:<password>@valor-assist-db.postgres.database.azure.com:5432/valorassist?sslmode=require" \
    NODE_ENV="production" \
    OPENAI_API_KEY="<your-openai-key>"
```

### Continuous Deployment

Set up continuous deployment from your Git repository:

```bash
az webapp deployment source config \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --repo-url https://github.com/your-org/valor-assist \
  --branch main
```

## VA API Integration

### Setting Up VA API Access

1. Register for VA API access at [developer.va.gov](https://developer.va.gov/)
2. Request access to specific VA APIs:
   - Benefits API
   - Health API
   - Verification API

3. Add the API keys to your Azure Key Vault:

```bash
# Create Key Vault
az keyvault create \
  --name valor-assist-vault \
  --resource-group valor-assist-rg \
  --location eastasia

# Add secrets
az keyvault secret set \
  --vault-name valor-assist-vault \
  --name VA-BENEFITS-API-KEY \
  --value "<your-benefits-api-key>"

az keyvault secret set \
  --vault-name valor-assist-vault \
  --name VA-HEALTH-API-KEY \
  --value "<your-health-api-key>"

az keyvault secret set \
  --vault-name valor-assist-vault \
  --name VA-VERIFICATION-API-KEY \
  --value "<your-verification-api-key>"
```

4. Configure your App Service to access Key Vault:

```bash
# Enable managed identity
az webapp identity assign \
  --name valor-assist-service \
  --resource-group valor-assist-rg

# Get the identity ID
identityId=$(az webapp identity show \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --query principalId -o tsv)

# Grant access to Key Vault
az keyvault set-policy \
  --name valor-assist-vault \
  --object-id $identityId \
  --secret-permissions get list
```

### VA API Integration in Code

Create a VA API integration service at `server/va-api.ts`:

```typescript
import axios from 'axios';

const BENEFITS_API_KEY = process.env.VA_BENEFITS_API_KEY;
const HEALTH_API_KEY = process.env.VA_HEALTH_API_KEY;
const VERIFICATION_API_KEY = process.env.VA_VERIFICATION_API_KEY;

// Base URLs for VA APIs
const BENEFITS_API_URL = 'https://sandbox-api.va.gov/services/benefits/v1';
const HEALTH_API_URL = 'https://sandbox-api.va.gov/services/fhir/v0/r4';
const VERIFICATION_API_URL = 'https://sandbox-api.va.gov/services/veteran_verification/v1';

// Benefits API - Get claim status
export async function getClaimStatus(claimId: string, ssn: string) {
  try {
    const response = await axios.get(`${BENEFITS_API_URL}/claims/${claimId}`, {
      headers: {
        'apiKey': BENEFITS_API_KEY,
        'X-VA-SSN': ssn,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching claim status:', error);
    throw new Error('Failed to retrieve claim status from VA API');
  }
}

// Health API - Get patient records
export async function getPatientRecords(icn: string) {
  try {
    const response = await axios.get(`${HEALTH_API_URL}/Patient/${icn}`, {
      headers: {
        'apiKey': HEALTH_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching patient records:', error);
    throw new Error('Failed to retrieve patient records from VA API');
  }
}

// Verification API - Verify veteran status
export async function verifyVeteranStatus(ssn: string, firstName: string, lastName: string, birthDate: string) {
  try {
    const response = await axios.post(`${VERIFICATION_API_URL}/status`, {
      ssn,
      firstName,
      lastName,
      birthDate
    }, {
      headers: {
        'apiKey': VERIFICATION_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying veteran status:', error);
    throw new Error('Failed to verify veteran status with VA API');
  }
}
```

## Chat Support Implementation

Implement chat support using Azure Communication Services:

1. Create Azure Communication Services resource:

```bash
az communication create \
  --name valor-assist-communication \
  --resource-group valor-assist-rg \
  --location global \
  --data-location eastasia
```

2. Get the connection string and key:

```bash
connectionString=$(az communication list-key \
  --name valor-assist-communication \
  --resource-group valor-assist-rg \
  --query primaryConnectionString -o tsv)

# Add to App Service configuration
az webapp config appsettings set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --settings \
    COMMUNICATION_CONNECTION_STRING="$connectionString"
```

## Document Analysis with AI

Implement document analysis using Azure Cognitive Services:

1. Get the Cognitive Services key:

```bash
cognitiveKey=$(az cognitiveservices account keys list \
  --name valor-assist-ai \
  --resource-group valor-assist-rg \
  --query key1 -o tsv)

# Add to App Service configuration
az webapp config appsettings set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --settings \
    COGNITIVE_SERVICES_KEY="$cognitiveKey" \
    COGNITIVE_SERVICES_ENDPOINT="https://eastasia.api.cognitive.microsoft.com/"
```

2. Create a document analysis service at `server/document-analysis.ts`:

```typescript
import { FormRecognizerClient, AzureKeyCredential } from "@azure/ai-form-recognizer";

const apiKey = process.env.COGNITIVE_SERVICES_KEY;
const endpoint = process.env.COGNITIVE_SERVICES_ENDPOINT;

// Initialize the Form Recognizer client
const client = new FormRecognizerClient(endpoint, new AzureKeyCredential(apiKey));

// Analyze VA documents
export async function analyzeDocument(documentUrl: string) {
  try {
    // Choose the appropriate model based on document type
    const poller = await client.beginRecognizeDocumentFromUrl(
      "prebuilt-document",
      documentUrl
    );
    
    const result = await poller.pollUntilDone();
    
    if (!result) {
      throw new Error("Document analysis failed");
    }
    
    return {
      text: result.content,
      fields: result.fields,
      tables: result.tables,
      pages: result.pages,
    };
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw new Error("Document analysis failed");
  }
}

// Extract medical information from documents
export async function extractMedicalInfo(documentUrl: string) {
  try {
    const poller = await client.beginRecognizeHealthcareDocumentFromUrl(documentUrl);
    const result = await poller.pollUntilDone();
    
    if (!result) {
      throw new Error("Medical document analysis failed");
    }
    
    return {
      entities: result.entities,
      relations: result.relations
    };
  } catch (error) {
    console.error("Error extracting medical info:", error);
    throw new Error("Medical information extraction failed");
  }
}
```

## Monitoring and Logging

Set up Application Insights for monitoring:

```bash
# Create Application Insights
az monitor app-insights component create \
  --app valor-assist-insights \
  --resource-group valor-assist-rg \
  --location eastasia

# Get the instrumentation key
instrumentationKey=$(az monitor app-insights component show \
  --app valor-assist-insights \
  --resource-group valor-assist-rg \
  --query instrumentationKey -o tsv)

# Add to App Service configuration
az webapp config appsettings set \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --settings \
    APPINSIGHTS_INSTRUMENTATIONKEY="$instrumentationKey"
```

## Security Hardening

Enhance security with these measures:

1. Configure SSL:

```bash
# Enforce HTTPS
az webapp update \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --https-only true
```

2. Set up IP restrictions:

```bash
# Only allow specific IP ranges
az webapp config access-restriction add \
  --name valor-assist-service \
  --resource-group valor-assist-rg \
  --rule-name 'Allow specific IPs' \
  --action Allow \
  --ip-address <your-ip-range> \
  --priority 100
```

3. Enable Azure Defender for App Service:

```bash
az security pricing create \
  --name AppServices \
  --tier Standard
```

## Troubleshooting

Common issues and solutions:

1. **Database Connection Issues**:
   - Check firewall rules
   - Verify connection string format
   - Confirm Azure service has network access

2. **Deployment Failures**:
   - Check App Service logs: `az webapp log tail --name valor-assist-service --resource-group valor-assist-rg`
   - Verify Node.js version compatibility
   - Check for build script errors

3. **API Management Problems**:
   - Review API definitions
   - Check backend service health
   - Verify Azure API Management policies

## Maintenance

Regular maintenance tasks:

1. Database backups:
   ```bash
   az postgres server configuration set \
     --name valor-assist-db \
     --resource-group valor-assist-rg \
     --configuration-name auto_backup \
     --value "ON"
   ```

2. Update Node.js version:
   ```bash
   az webapp config set \
     --name valor-assist-service \
     --resource-group valor-assist-rg \
     --linux-fx-version "NODE|20-lts"
   ```

3. Scale resources during peak times:
   ```bash
   az appservice plan update \
     --name valor-assist-plan \
     --resource-group valor-assist-rg \
     --sku S1
   ```

## Reference Documentation

- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure PostgreSQL Documentation](https://docs.microsoft.com/en-us/azure/postgresql/)
- [Azure API Management Documentation](https://docs.microsoft.com/en-us/azure/api-management/)
- [VA API Documentation](https://developer.va.gov/explore/api)
- [Azure Cognitive Services Documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/)