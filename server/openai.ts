import OpenAI from "openai";

// Check if API key exists
const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

// Only initialize OpenAI client if API key is available
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
let openai: OpenAI | null = null;
if (hasOpenAIKey) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else {
  console.warn("OpenAI API key not found. AI features will be disabled.");
}

// Analyze claim information to provide recommendations
export async function analyzeClaimInfo(claimData: any): Promise<any> {
  // Return fallback response if OpenAI is not available
  if (!openai || !hasOpenAIKey) {
    console.warn("OpenAI API unavailable for claim analysis - using fallback");
    return {
      eligibility: 50,
      recommendations: ["API key required for detailed AI analysis"],
      missingEvidence: ["API key required for evidence analysis"],
      nextSteps: ["Add OpenAI API key to enable AI-powered analysis"]
    };
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are an AI assistant specializing in VA claims analysis. Analyze the provided claim information and provide actionable recommendations. Return a JSON object with the following structure: { 'eligibility': number (0-100), 'recommendations': string[], 'missingEvidence': string[], 'nextSteps': string[] }"
        },
        {
          role: "user",
          content: JSON.stringify(claimData)
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error: any) {
    console.error("Error analyzing claim:", error);
    throw new Error(`Failed to analyze claim: ${error.message}`);
  }
}

// Generate document templates based on claim type
export async function generateDocumentTemplate(claimType: string, claimData: any): Promise<string> {
  // Return fallback template if OpenAI is not available
  if (!openai || !hasOpenAIKey) {
    console.warn("OpenAI API unavailable for document generation - using fallback template");
    return `
# VA Claim Document Template (Basic Version)
## Claim Type: ${claimType}

This is a basic template for your ${claimType} claim. 
For a detailed, AI-generated template, please add an OpenAI API key.

## Claimant Information:
- Name: ${claimData.firstName} ${claimData.lastName}
- Contact: ${claimData.email} / ${claimData.phone}
- Military Branch: ${claimData.branch}
- Service Period: ${claimData.serviceStart} to ${claimData.serviceEnd || 'Present'}
- Discharge Type: ${claimData.dischargeType}

## Claim Description:
${claimData.claimDescription}

## Instructions:
Please complete this template with all relevant information. For personalized assistance,
enable AI-powered document generation by adding your OpenAI API key.
    `;
  }
  
  try {
    const response = await openai!.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are an AI assistant specializing in VA documentation. Generate a document template for the specified claim type using the provided claim information. Format the document appropriately for VA submission."
        },
        {
          role: "user",
          content: `Claim Type: ${claimType}\nClaim Data: ${JSON.stringify(claimData)}`
        }
      ]
    });

    return response.choices[0].message.content || "";
  } catch (error: any) {
    console.error("Error generating document template:", error);
    throw new Error(`Failed to generate document template: ${error.message}`);
  }
}

// Identify missing evidence based on claim type
export async function identifyMissingEvidence(claimType: string, providedDocuments: string[]): Promise<string[]> {
  // Return fallback evidence if OpenAI is not available
  if (!openai || !hasOpenAIKey) {
    console.warn("OpenAI API unavailable for evidence analysis - using fallback");
    
    // Basic list of common documents for most VA claims
    const commonDocuments = [
      "DD-214 (Certificate of Release or Discharge from Active Duty)",
      "Military medical records",
      "VA medical records",
      "Private medical records",
      "Nexus letter from healthcare provider"
    ];
    
    // Filter out documents that are already provided
    return commonDocuments.filter(doc => !providedDocuments.includes(doc));
  }
  
  try {
    const response = await openai!.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are an AI assistant specializing in VA claims. Based on the claim type, identify what evidence is typically required and what might be missing from the provided documents. Return a JSON object with a 'missingEvidence' array of missing document types."
        },
        {
          role: "user",
          content: `Claim Type: ${claimType}\nProvided Documents: ${JSON.stringify(providedDocuments)}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.missingEvidence || [];
  } catch (error: any) {
    console.error("Error identifying missing evidence:", error);
    throw new Error(`Failed to identify missing evidence: ${error.message}`);
  }
}

// Assess claim eligibility
export async function assessEligibility(claimData: any): Promise<{
  eligibilityScore: number,
  rationale: string
}> {
  // Return fallback assessment if OpenAI is not available
  if (!openai || !hasOpenAIKey) {
    console.warn("OpenAI API unavailable for eligibility assessment - using fallback");
    return {
      eligibilityScore: 50,
      rationale: "Basic eligibility assessment without AI analysis. Please add an OpenAI API key for detailed eligibility assessment based on your specific claim information."
    };
  }
  
  try {
    const response = await openai!.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are an AI assistant specializing in VA eligibility assessment. Based on the provided claim data, assess the veteran's eligibility for the requested benefits. Return a JSON object with: { 'eligibilityScore': number (0-100), 'rationale': string }"
        },
        {
          role: "user",
          content: JSON.stringify(claimData)
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error: any) {
    console.error("Error assessing eligibility:", error);
    throw new Error(`Failed to assess eligibility: ${error.message}`);
  }
}
