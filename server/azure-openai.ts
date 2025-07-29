import { AzureOpenAI } from 'openai';

// Azure OpenAI configuration for fine-tuned model
const azureConfig = {
  endpoint: process.env.AZURE_OPENAI_ENDPOINT || "",
  apiKey: process.env.AZURE_OPENAI_API_KEY || "",
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT_ID || "",
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

  // Generate chat response using fine-tuned model (for /api/ai/chat route)
  async generateChatResponse(
    messages: ChatMessage[], 
    veteranContext?: any
  ): Promise<string> {
    console.log('🤖 AzureOpenAIService.generateChatResponse called with:', messages.length, 'messages');
    
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

      console.log('🚀 Calling Azure OpenAI with deployment:', this.deploymentId);

      const response = await this.client.chat.completions.create({
        model: this.deploymentId, // Use the fine-tuned deployment
        messages: apiMessages,
        temperature: 0.7, // Balanced creativity for VA responses
        max_tokens: 1000, // Reasonable response length
        top_p: 0.9 // Focus on most relevant responses
      });

      const result = response.choices[0]?.message?.content || 
        "I apologize, but I couldn't generate a response. Please try rephrasing your question about VA benefits.";
      
      console.log('✅ Azure OpenAI response generated successfully');
      return result;
    } catch (error: any) {
      console.error("❌ Error with Azure OpenAI fine-tuned model:", error);
      // Return fallback response on error
      return this.getFallbackResponse(messages[messages.length - 1]?.content || "");
    }
  }

  // Generate single message response (for bot processing)
  async generateResponse(message: string, threadId: string): Promise<string> {
    console.log(`🤖 Using fine-tuned model: gpt-4.1-nano for thread: ${threadId}`);
    
    const messages: ChatMessage[] = [
      { role: "user", content: message }
    ];
    
    return this.generateChatResponse(messages);
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
    
    if (message.includes('evidence') || message.includes('document')) {
      return "Strong evidence is crucial for VA claims. Key documents include: service medical records, private treatment records, nexus letters from doctors linking your condition to service, buddy statements, and service personnel records. What type of evidence are you looking to gather?";
    }
    
    if (message.includes('c&p') || message.includes('exam')) {
      return "C&P (Compensation & Pension) exams help the VA determine your disability rating. Tips: Be honest about your worst days, bring all medical records, describe how your condition affects daily activities, and don't minimize your symptoms. Would you like specific preparation advice?";
    }
    
    // Generic helpful response
    return "Hello! I'm Val, your VA benefits assistant powered by a specialized fine-tuned AI model. I can help with disability claims, appeals, education benefits, healthcare enrollment, and navigating VA processes. The AI model is currently running in limited mode, but I'll provide the best guidance I can. What VA topic would you like help with?";
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; model: string; available: boolean }> {
    if (!this.client) {
      return {
        status: "fallback-mode",
        model: "fallback-responses",
        available: false
      };
    }

    try {
      const response = await this.client.chat.completions.create({
        model: this.deploymentId,
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 10
      });
      
      return {
        status: "healthy",
        model: "gpt-4.1-nano (fine-tuned)",
        available: response.choices.length > 0
      };
    } catch (error) {
      console.error('Azure OpenAI health check failed:', error);
      return {
        status: "error",
        model: "gpt-4.1-nano (fine-tuned)",
        available: false
      };
    }
  }
}

export const azureOpenAIService = new AzureOpenAIService();