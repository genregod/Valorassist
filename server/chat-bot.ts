import { ChatClient } from "@azure/communication-chat";
import { CommunicationIdentityClient } from "@azure/communication-identity";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";

interface BotResponse {
  intent: string;
  response: string;
  suggestions?: string[];
}

export class VeteranAssistantBot {
  private botUserId: string;
  private botToken: string;
  private chatClient: ChatClient | null = null;

  constructor(botUserId: string, botToken: string, endpoint: string) {
    this.botUserId = botUserId;
    this.botToken = botToken;
    this.initializeChatClient(endpoint);
  }

  private initializeChatClient(endpoint: string) {
    const tokenCredential = new AzureCommunicationTokenCredential(this.botToken);
    this.chatClient = new ChatClient(endpoint, tokenCredential);
  }

  // Analyze user message and determine intent
  private analyzeIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('claim') && (lowerMessage.includes('status') || lowerMessage.includes('check'))) {
      return 'claim_status';
    } else if (lowerMessage.includes('file') || lowerMessage.includes('submit')) {
      return 'file_claim';
    } else if (lowerMessage.includes('appeal')) {
      return 'appeal_process';
    } else if (lowerMessage.includes('document') || lowerMessage.includes('evidence')) {
      return 'documents';
    } else if (lowerMessage.includes('rating') || lowerMessage.includes('disability')) {
      return 'disability_rating';
    } else if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
      return 'general_help';
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return 'greeting';
    } else {
      return 'unknown';
    }
  }

  // Generate bot response based on intent
  private generateResponse(intent: string): BotResponse {
    const responses: Record<string, BotResponse> = {
      greeting: {
        intent: 'greeting',
        response: "Hello! I'm your VA Claims Assistant. I'm here to help you navigate the claims process. What can I help you with today?",
        suggestions: [
          "Check claim status",
          "File a new claim",
          "Upload documents",
          "Learn about appeals"
        ]
      },
      claim_status: {
        intent: 'claim_status',
        response: "I can help you check your claim status. To get started, I'll need your claim number or we can look it up using your information. Would you like me to guide you through checking your claim status?",
        suggestions: [
          "Enter claim number",
          "Look up by SSN",
          "View recent claims"
        ]
      },
      file_claim: {
        intent: 'file_claim',
        response: "I'll help you file a new claim. The process involves:\n1. Gathering medical evidence\n2. Completing VA Form 21-526EZ\n3. Submitting supporting documents\n\nWould you like me to walk you through each step?",
        suggestions: [
          "Start new claim",
          "Required documents",
          "Eligibility requirements"
        ]
      },
      appeal_process: {
        intent: 'appeal_process',
        response: "If your claim was denied or you disagree with the rating, you have several appeal options:\n- Higher-Level Review\n- Supplemental Claim\n- Board Appeal\n\nWhich option would you like to learn more about?",
        suggestions: [
          "Higher-Level Review",
          "Supplemental Claim",
          "Board Appeal",
          "Appeal deadlines"
        ]
      },
      documents: {
        intent: 'documents',
        response: "Supporting documents are crucial for your claim. Common documents include:\n- Medical records\n- Service treatment records\n- Nexus letters\n- Buddy statements\n\nDo you need help gathering or uploading any of these?",
        suggestions: [
          "Upload documents",
          "Required documents list",
          "Get medical records"
        ]
      },
      disability_rating: {
        intent: 'disability_rating',
        response: "Your disability rating determines your compensation amount. Ratings range from 0% to 100% in 10% increments. Would you like to:\n- Understand how ratings are calculated?\n- Check current compensation rates?\n- Learn how to increase your rating?",
        suggestions: [
          "Rating calculator",
          "Compensation rates",
          "Increase rating"
        ]
      },
      general_help: {
        intent: 'general_help',
        response: "I'm here to help with all aspects of your VA claims. Here are some things I can assist with:\n- Filing new claims\n- Checking claim status\n- Understanding the appeals process\n- Document preparation\n- Disability ratings\n\nWhat would you like help with?",
        suggestions: [
          "File a claim",
          "Check status",
          "Appeals help",
          "Documents"
        ]
      },
      unknown: {
        intent: 'unknown',
        response: "I'm not sure I understand what you're looking for. Could you please rephrase your question? I can help with:\n- VA claims\n- Appeals\n- Documents\n- Disability ratings\n\nOr type 'help' to see all available options.",
        suggestions: [
          "Get help",
          "File a claim",
          "Check claim status"
        ]
      }
    };

    return responses[intent] || responses.unknown;
  }

  // Process incoming message and generate response
  public async processMessage(message: string, threadId: string): Promise<BotResponse> {
    const intent = this.analyzeIntent(message);
    const response = this.generateResponse(intent);
    
    // Log for debugging
    console.log(`Bot processed message: "${message}" with intent: "${intent}"`);
    
    return response;
  }

  // Send message to chat thread
  public async sendMessage(threadId: string, message: string): Promise<void> {
    if (!this.chatClient) {
      throw new Error("Chat client not initialized");
    }

    try {
      const chatThreadClient = this.chatClient.getChatThreadClient(threadId);
      await chatThreadClient.sendMessage({
        content: message,
        senderDisplayName: "VA Assistant"
      });
    } catch (error) {
      console.error("Error sending bot message:", error);
      throw error;
    }
  }

  // Check if message is from bot to avoid infinite loops
  public isFromBot(senderId: string): boolean {
    return senderId === this.botUserId;
  }
}

// Helper function to create bot user
export async function createBotUser(connectionString: string): Promise<{ userId: string; token: string }> {
  const identityClient = new CommunicationIdentityClient(connectionString);
  const user = await identityClient.createUser();
  const tokenResponse = await identityClient.getToken(user, ["chat"]);
  
  return {
    userId: user.communicationUserId,
    token: tokenResponse.token
  };
}