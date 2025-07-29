import { 
  ChatClient, 
  ChatThreadClient,
  ChatParticipant,
  ChatMessageType
} from "@azure/communication-chat";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";
import { CommunicationIdentityClient } from "@azure/communication-identity";
import { VeteranAssistantBot, createBotUser } from "./chat-bot";
import { azureOpenAIService } from "./azure-openai";

// Check if Azure Communication Services credentials exist
const hasConnectionString = !!process.env.AZURE_COMMUNICATION_CONNECTION_STRING;

// Store active chat threads and participants
interface ActiveThread {
  threadId: string;
  participants: ChatParticipant[];
}

let communicationIdentityClient: CommunicationIdentityClient | null = null;
let chatBot: VeteranAssistantBot | null = null;

if (hasConnectionString) {
  try {
    communicationIdentityClient = new CommunicationIdentityClient(
      process.env.AZURE_COMMUNICATION_CONNECTION_STRING as string
    );
    console.log("Azure Communication Services client initialized");
    
    // Initialize bot
    initializeBot();
  } catch (error: any) {
    console.error("Failed to initialize Azure Communication Services:", error.message);
  }
} else {
  console.warn("Azure Communication Services connection string is missing - chat functionality will be limited");
}

// Map to store active threads by user ID
const activeThreadsByUser: Map<string, ActiveThread[]> = new Map();

// Initialize the chat bot
async function initializeBot() {
  if (!hasConnectionString) return;
  
  try {
    const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING as string;
    const botUser = await createBotUser(connectionString);
    const endpoint = connectionString.match(/endpoint=https:\/\/([^;]+)/)?.[1];
    
    if (endpoint && botUser) {
      chatBot = new VeteranAssistantBot(
        botUser.communicationUserId, 
        botUser.token, 
        `https://${endpoint}`
      );
      console.log("VeteranAssistantBot initialized successfully");
    }
  } catch (error: any) {
    console.error("Failed to initialize bot:", error.message);
  }
}

// Create a new chat user
export async function createChatUser(displayName: string) {
  if (!communicationIdentityClient) {
    throw new Error("Azure Communication Services not initialized");
  }

  try {
    // Create a user
    const userResponse = await communicationIdentityClient.createUser();
    console.log(`User created with id: ${userResponse.communicationUserId}`);

    // Get a token for the user
    const tokenResponse = await communicationIdentityClient.getToken(
      userResponse,
      ["chat"]
    );
    console.log(`Token created for user: expires on ${tokenResponse.expiresOn}`);

    return {
      communicationUserId: userResponse.communicationUserId,
      token: tokenResponse.token,
      displayName,
    };
  } catch (error: any) {
    throw new Error(`Failed to create chat user: ${error.message}`);
  }
}

// Create a support chat thread
export async function createSupportChatThread(
  topic: string,
  participantIds: string[]
) {
  if (!hasConnectionString) {
    throw new Error("Azure Communication Services not configured");
  }

  try {
    // Create a chat client for the first participant (support agent)
    const tokenCredential = new AzureCommunicationTokenCredential(
      process.env.AZURE_COMMUNICATION_USER_TOKEN as string
    );

    const chatClient = new ChatClient(
      process.env.AZURE_COMMUNICATION_ENDPOINT as string,
      tokenCredential
    );

    // Create participants array
    const participants = participantIds.map((id) => ({
      id: { communicationUserId: id },
      displayName: "Participant",
    }));

    // Create the chat thread
    const createChatThreadRequest = {
      topic,
    };

    const createChatThreadOptions = {
      participants,
    };

    const createChatThreadResult = await chatClient.createChatThread(
      createChatThreadRequest,
      createChatThreadOptions
    );

    const threadId = createChatThreadResult.chatThread?.id;
    if (!threadId) {
      throw new Error("Failed to get thread ID from chat thread creation");
    }

    console.log(`Chat thread created with id: ${threadId}`);

    // Store the thread information
    const activeThread: ActiveThread = {
      threadId,
      participants: participants.map((p) => ({
        id: p.id,
        displayName: p.displayName || "Unknown",
        shareHistoryTime: new Date(),
      })),
    };

    // Add to active threads for each participant
    participantIds.forEach((participantId) => {
      const userThreads = activeThreadsByUser.get(participantId) || [];
      userThreads.push(activeThread);
      activeThreadsByUser.set(participantId, userThreads);
    });

    return {
      threadId,
      topic,
      participants: activeThread.participants,
    };
  } catch (error: any) {
    throw new Error(`Failed to create support chat thread: ${error.message}`);
  }
}

// Send a message to a chat thread
export async function sendChatMessage(
  threadId: string,
  senderId: string,
  content: string
) {
  if (!hasConnectionString) {
    throw new Error("Azure Communication Services not configured");
  }

  try {
    const tokenCredential = new AzureCommunicationTokenCredential(
      process.env.AZURE_COMMUNICATION_USER_TOKEN as string
    );

    const chatClient = new ChatClient(
      process.env.AZURE_COMMUNICATION_ENDPOINT as string,
      tokenCredential
    );

    const chatThreadClient = chatClient.getChatThreadClient(threadId);

    const sendMessageRequest = {
      content,
      senderDisplayName: "Support Agent", // This should be dynamic based on the sender
      type: "text" as ChatMessageType,
    };

    const sendMessageOptions = {
      senderDisplayName: "Support Agent",
      type: "text" as ChatMessageType,
    };

    const sendChatMessageResult = await chatThreadClient.sendMessage(
      sendMessageRequest,
      sendMessageOptions
    );

    const messageId = sendChatMessageResult.id;
    console.log(`Message sent with id: ${messageId}`);

    return {
      messageId,
      content,
      senderId,
      threadId,
      timestamp: new Date(),
    };
  } catch (error: any) {
    throw new Error(`Failed to send chat message: ${error.message}`);
  }
}

// Get messages from a chat thread
export async function getChatMessages(threadId: string) {
  if (!hasConnectionString) {
    throw new Error("Azure Communication Services not configured");
  }

  try {
    const tokenCredential = new AzureCommunicationTokenCredential(
      process.env.AZURE_COMMUNICATION_USER_TOKEN as string
    );

    const chatClient = new ChatClient(
      process.env.AZURE_COMMUNICATION_ENDPOINT as string,
      tokenCredential
    );

    const chatThreadClient = chatClient.getChatThreadClient(threadId);

    const messages = [];
    const listMessagesOptions = {
      maxPageSize: 20,
    };

    for await (const message of chatThreadClient.listMessages(
      listMessagesOptions
    )) {
      messages.push({
        id: message.id,
        content: message.content?.message || "",
        senderId: message.sender?.communicationUserId || "unknown",
        senderDisplayName: message.senderDisplayName || "Unknown",
        createdOn: message.createdOn,
        type: message.type,
      });
    }

    console.log(`Retrieved ${messages.length} messages from thread ${threadId}`);
    return messages.reverse(); // Return in chronological order
  } catch (error: any) {
    throw new Error(`Failed to get chat messages: ${error.message}`);
  }
}

// Add participant to a chat thread
export async function addChatParticipant(
  threadId: string,
  participantId: string,
  displayName: string
) {
  if (!hasConnectionString) {
    throw new Error("Azure Communication Services not configured");
  }

  try {
    const tokenCredential = new AzureCommunicationTokenCredential(
      process.env.AZURE_COMMUNICATION_USER_TOKEN as string
    );

    const chatClient = new ChatClient(
      process.env.AZURE_COMMUNICATION_ENDPOINT as string,
      tokenCredential
    );

    const chatThreadClient = chatClient.getChatThreadClient(threadId);

    const addParticipantsRequest = {
      participants: [
        {
          id: { communicationUserId: participantId },
          displayName,
        },
      ],
    };

    await chatThreadClient.addParticipants(addParticipantsRequest);
    console.log(`Participant ${participantId} added to thread ${threadId}`);

    return {
      participantId,
      displayName,
      threadId,
      addedAt: new Date(),
    };
  } catch (error: any) {
    throw new Error(`Failed to add chat participant: ${error.message}`);
  }
}

// Remove participant from a chat thread
export async function removeChatParticipant(
  threadId: string,
  participantId: string
) {
  if (!hasConnectionString) {
    throw new Error("Azure Communication Services not configured");
  }

  try {
    const tokenCredential = new AzureCommunicationTokenCredential(
      process.env.AZURE_COMMUNICATION_USER_TOKEN as string
    );

    const chatClient = new ChatClient(
      process.env.AZURE_COMMUNICATION_ENDPOINT as string,
      tokenCredential
    );

    const chatThreadClient = chatClient.getChatThreadClient(threadId);

    await chatThreadClient.removeParticipant({
      communicationUserId: participantId,
    });

    console.log(`Participant ${participantId} removed from thread ${threadId}`);

    return {
      participantId,
      threadId,
      removedAt: new Date(),
    };
  } catch (error: any) {
    throw new Error(`Failed to remove chat participant: ${error.message}`);
  }
}

// Process message with bot
export async function processBotMessage(threadId: string, message: string) {
  console.log(`🤖 Processing bot message for thread: ${threadId}`);
  
  try {
    // First try to use Azure OpenAI fine-tuned model
    if (azureOpenAIService.isAvailable()) {
      console.log("✅ Using Azure OpenAI fine-tuned model");
      const response = await azureOpenAIService.generateResponse(message, threadId);
      
      return {
        response,
        suggestions: ["File a claim", "Check status", "Appeals help", "Contact VSO"],
        intent: "va_assistance",
        source: "azure_openai_fine_tuned"
      };
    }
    
    // Fallback to Azure Communication Services bot if available
    if (chatBot) {
      console.log("Using Azure Communication Services bot as fallback");
      const botResponse = await chatBot.processMessage(message, threadId);
      
      // Only send bot response back to the chat thread if it's a real thread (not hardcoded)
      // Skip sending for demo/test threads to avoid 404 errors
      if (hasConnectionString && chatBot && !threadId.startsWith('thread-')) {
        try {
          await chatBot.sendMessage(threadId, botResponse.response);
        } catch (error) {
          console.error("Failed to send bot message to thread:", error);
        }
      }
      
      return botResponse;
    }
    
    // Last resort: use the fallback bot
    console.log("Using fallback bot (no Azure services available)");
    const fallbackBot = new VeteranAssistantBot("fallback-bot", "fallback-token", "");
    
    const botResponse = await fallbackBot.processMessage(message, threadId);
    console.log("Fallback bot processed message successfully:", botResponse);
    return botResponse;
    
  } catch (error: any) {
    console.error("❌ Error processing bot message:", error.message);
    
    // Return a helpful error response
    return {
      response: "I apologize, but I'm having trouble processing your request right now. However, I can still help you with VA benefits questions! For immediate assistance, you can call the VA at 1-800-827-1000, or try asking me about specific topics like disability claims, appeals, or education benefits.",
      suggestions: ["Disability claims help", "Appeals process", "Education benefits", "Contact VA: 1-800-827-1000"],
      intent: "error",
      source: "fallback"
    };
  }
}