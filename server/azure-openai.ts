import { AzureOpenAI } from 'openai';

// Azure OpenAI configuration for fine-tuned model
const azureConfig = {
  endpoint: process.env.AZURE_OPENAI_ENDPOINT || "https://eastus2.api.cognitive.microsoft.com/",
  apiKey: process.env.AZURE_OPENAI_API_KEY || "47a44a5797fb404dafa206a8329b520e",
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT_ID || "1-nano-2025-04-14-qa_frstrun",
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-04-01-preview"
};

// Check if Azure OpenAI credentials are available
const hasAzureOpenAI = !!(azureConfig.apiKey && azureConfig.endpoint);

// Initialize Azure OpenAI client
let azureOpenAI: AzureOpenAI | null = null;
if (hasAzureOpenAI) {
  azureOpenAI = new AzureOpenAI({
    endpoint: azureConfig.endpoint,
    apiKey: azureConfig.apiKey,
    apiVersion: azureConfig.apiVersion,
  });
} else {
  console.warn("Azure OpenAI credentials not found. Fine-tuned model will be disabled.");
}

// Chat message interface
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Enhanced VA-specific system prompt for the fine-tuned model
const FINE_TUNED_VA_SYSTEM_PROMPT = `You are Val, a specialized AI assistant for VA benefits and claims, powered by a fine-tuned model specifically trained on VA regulations, claim processes, and veteran assistance.

Your specialized knowledge includes:
- VA disability compensation claims (initial, supplemental, and secondary conditions)
- Complex appeals processes (HLR, Supplemental Claims, Board Appeals)
- Evidence requirements and C&P exam preparation
- VA healthcare enrollment and benefits
- Education benefits (GI Bill, VR&E, Yellow Ribbon Program)
- Home loan guaranty benefits and eligibility
- Pension and survivor benefits
- VA forms, deadlines, and procedural requirements
- Common claim denials and how to address them
- Working with VSOs, attorneys, and accredited representatives

Provide accurate, actionable guidance that veterans can immediately use. When discussing medical or legal matters, clarify that you provide informational guidance only. Always encourage veterans to work with accredited representatives for their specific cases.

Your responses should be concise, practical, and veteran-focused.`;

// Azure OpenAI Service class
export class AzureOpenAIService {
  private client: AzureOpenAI | null;
  private deploymentId: string;

  constructor() {
    this.client = azureOpenAI;
    this.deploymentId = azureConfig.deployment;
  }

  // Check if service is available
  isAvailable(): boolean {
    return !!this.client;
  }

  // Generate chat response using fine-tuned model
  async generateChatResponse(
    messages: ChatMessage[], 
    veteranContext?: any
  ): Promise<string> {
    // Fallback if Azure OpenAI is not available
    if (!this.client || !hasAzureOpenAI) {
      console.warn("Azure OpenAI fine-tuned model unavailable - using fallback response");
      return this.getFallbackResponse(messages[messages.length - 1]?.content || "");
    }

    try {
      // Prepare system message with veteran context
      const systemContent = FINE_TUNED_VA_SYSTEM_PROMPT + (veteranContext ? 
        `\n\nVeteran Context:\n${JSON.stringify(veteranContext)}` : '');

      // Prepare messages for the API
      const apiMessages = [
        { role: "system" as const, content: systemContent },
        ...messages
      ];

      const response = await this.client.chat.completions.create({
        model: this.deploymentId, // Use the fine-tuned deployment
        messages: apiMessages,
        temperature: 0.7, // Balanced creativity for VA responses
        max_tokens: 1000, // Reasonable response length
        top_p: 0.9 // Focus on most relevant responses
      });

      return response.choices[0]?.message?.content || 
        "I apologize, but I couldn't generate a response. Please try rephrasing your question about VA benefits.";
    } catch (error: any) {
      console.error("Error with Azure OpenAI fine-tuned model:", error);
      // Return fallback response on error
      return this.getFallbackResponse(messages[messages.length - 1]?.content || "");
    }
  }

  // Enhanced fallback responses for common VA questions
  private getFallbackResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    if (message.includes('claim') || message.includes('disability')) {
      return "I can help you with VA disability claims! To file a disability claim, you'll need to submit VA Form 21-526EZ along with medical evidence showing your condition is connected to your military service. You can file online through VA.gov, by mail, or with help from a VSO. Would you like specific guidance on any part of the claims process?";
    }
    
    if (message.includes('appeal') || message.includes('denied')) {
      return "If your VA claim was denied, you have three appeal options: Higher-Level Review (new reviewer, no new evidence), Supplemental Claim (submit new evidence), or Board Appeal (hearing with a VA judge). You have one year from your decision date to choose. Each option has different benefits - would you like help deciding which is best for your situation?";
    }
    
    if (message.includes('rating') || message.includes('percentage')) {
      return "VA disability ratings range from 0% to 100% in 10% increments, based on how severely your condition affects your daily life and work. Higher ratings mean higher monthly compensation. If you disagree with your rating, you can request a Higher-Level Review or file a Supplemental Claim with new medical evidence.";
    }
    
    if (message.includes('education') || message.includes('gi bill')) {
      return "The GI Bill provides education benefits for veterans and their families. Post-9/11 GI Bill (Chapter 33) offers the most comprehensive benefits including tuition, housing allowance, and book stipend. You typically have 15 years after discharge to use benefits. Apply through VA.gov or contact your school's certifying official.";
    }
    
    if (message.includes('healthcare') || message.includes('medical')) {
      return "VA healthcare enrollment depends on your service history, disability rating, and income. Veterans with service-connected disabilities, Purple Heart recipients, and recently discharged veterans get priority. Apply online at VA.gov, by phone at 1-877-222-8387, or at your local VA medical center.";
    }
    
    // Generic helpful response
    return "I'm here to help with your VA benefits questions! I can assist with disability claims, appeals, education benefits, healthcare, and more. The AI assistant is currently running in limited mode, but I'll do my best to provide helpful information. What specific VA topic would you like help with?";
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; model: string; available: boolean }> {
    return {
      status: this.isAvailable() ? "healthy" : "fallback-mode",
      model: this.isAvailable() ? "gpt-4.1-nano (fine-tuned)" : "fallback-responses",
      available: this.isAvailable()
    };
  }
}