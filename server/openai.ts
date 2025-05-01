import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

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

// VA-specific system prompt for consistent response quality
const VA_CLAIMS_SYSTEM_PROMPT = `You are Val, an AI assistant for the Valor Assist platform specializing in VA benefits and claims. 
You have extensive knowledge of:
- VA disability compensation claims
- Appeals processes including Higher-Level Reviews, Supplemental Claims, and Board Appeals
- Required evidence standards for different claim types
- VA healthcare benefits
- Education benefits (GI Bill, VR&E)
- Home loan guaranty benefits
- Pension benefits
- VA forms and documentation requirements

Respond with accurate, concise, and helpful information. Focus on practical advice that veterans can immediately apply to their claims process. When unsure about specific details, acknowledge limitations and suggest reliable VA resources. 

For medical or legal questions, clarify that you provide informational guidance only, not medical or legal advice. Always encourage veterans to work with accredited VSOs, attorneys, or claims agents for their specific cases.`;

// Chat history types
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Utility function to safely parse JSON responses
function safeJsonParse(jsonString: string | null): any {
  if (!jsonString) return {};
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing JSON response:", error);
    return {};
  }
}

// Convert our ChatMessage type to OpenAI's ChatCompletionMessageParam
function convertToOpenAIMessages(messages: ChatMessage[]): ChatCompletionMessageParam[] {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content
  })) as ChatCompletionMessageParam[];
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

    const content = response.choices[0].message.content || "{}";
    return JSON.parse(content);
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

    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);
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

    const content = response.choices[0].message.content || "{}";
    return safeJsonParse(content);
  } catch (error: any) {
    console.error("Error assessing eligibility:", error);
    throw new Error(`Failed to assess eligibility: ${error.message}`);
  }
}

// Generate AI chatbot response based on conversation history
export async function generateChatResponse(
  messages: ChatMessage[], 
  veteranContext?: any // Optional context about the veteran
): Promise<string> {
  // Return fallback response if OpenAI is not available
  if (!openai || !hasOpenAIKey) {
    console.warn("OpenAI API unavailable for chat - using fallback response");
    return "I'm sorry, but the AI assistant is currently unavailable. Please try again later or contact support for assistance with your VA benefits questions.";
  }
  
  try {
    // Prepare the messages array with system prompt
    const systemMessage: ChatCompletionMessageParam = {
      role: "system",
      content: VA_CLAIMS_SYSTEM_PROMPT + (veteranContext ? 
        `\n\nVeteran Context:\n${JSON.stringify(veteranContext)}` : '')
    };
    
    // Convert our ChatMessage type to OpenAI's type
    const apiMessages: ChatCompletionMessageParam[] = [
      systemMessage,
      ...convertToOpenAIMessages(messages)
    ];
    
    const response = await openai!.chat.completions.create({
      model: "gpt-4o",
      messages: apiMessages,
      temperature: 0.7, // Balanced between creativity and accuracy
      max_tokens: 1000 // Reasonable response length
    });

    return response.choices[0].message.content || 
      "I apologize, but I couldn't generate a response. Please try rephrasing your question.";
  } catch (error: any) {
    console.error("Error generating chat response:", error);
    throw new Error(`Failed to generate chat response: ${error.message}`);
  }
}

// Search BVA decisions for relevant case law and precedents
export async function searchLegalPrecedents(claimDetails: any): Promise<{
  relevantCases: Array<{
    caseId: string,
    summary: string,
    relevance: string,
    date: string
  }>
}> {
  // Return fallback if OpenAI is not available
  if (!openai || !hasOpenAIKey) {
    console.warn("OpenAI API unavailable for legal precedent search - using fallback");
    return {
      relevantCases: [
        {
          caseId: "N/A",
          summary: "AI analysis not available. Please add an OpenAI API key for legal precedent matching.",
          relevance: "N/A",
          date: "N/A"
        }
      ]
    };
  }
  
  try {
    const response = await openai!.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are an AI legal assistant specializing in VA claims law. Based on the claim details, identify relevant BVA decisions and case precedents that might apply. For each case, provide a case ID (docket number format), brief summary, relevance explanation, and date. Return a JSON object with a 'relevantCases' array containing these details."
        },
        {
          role: "user",
          content: JSON.stringify(claimDetails)
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || "{}";
    return safeJsonParse(content);
  } catch (error: any) {
    console.error("Error searching legal precedents:", error);
    throw new Error(`Failed to search legal precedents: ${error.message}`);
  }
}

// Analyze document for VA claim relevance and extract key information
export async function analyzeDocument(
  documentText: string,
  documentType?: string
): Promise<{
  relevance: number, // 0-100 scale
  keyInformation: Record<string, string>,
  suggestedAction: string
}> {
  // Return fallback if OpenAI is not available
  if (!openai || !hasOpenAIKey) {
    console.warn("OpenAI API unavailable for document analysis - using fallback");
    return {
      relevance: 50,
      keyInformation: {
        "document_type": documentType || "Unknown",
        "analysis": "AI analysis not available. Please add an OpenAI API key for detailed document analysis."
      },
      suggestedAction: "Review document manually for relevant information."
    };
  }
  
  try {
    const response = await openai!.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are an AI document analyzer specializing in VA claims documentation. Analyze the provided document text and extract key information relevant to VA claims. Determine the document's relevance to VA claims processes on a scale of 0-100. Return a JSON object with 'relevance' (number), 'keyInformation' (object of key-value pairs), and 'suggestedAction' (string)."
        },
        {
          role: "user",
          content: `Document Type: ${documentType || "Unknown"}\nDocument Text: ${documentText}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || "{}";
    return safeJsonParse(content);
  } catch (error: any) {
    console.error("Error analyzing document:", error);
    throw new Error(`Failed to analyze document: ${error.message}`);
  }
}
