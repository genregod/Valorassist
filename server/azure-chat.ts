import { 
  ChatClient, 
  ChatThreadClient,
  ChatParticipant,
  ChatMessageType
} from "@azure/communication-chat";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";
import { CommunicationIdentityClient } from "@azure/communication-identity";
import { VeteranAssistantBot, createBotUser } from "./chat-bot";

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
    
    if (!endpoint) {
      console.error("Failed to extract endpoint from connection string");
      return;
    }
    
    chatBot = new VeteranAssistantBot(
      botUser.userId,
      botUser.token,
      `https://${endpoint}`
    );
    
    console.log("Chat bot initialized successfully");
  } catch (error: any) {
    console.error("Failed to initialize chat bot:", error.message);
  }
}

// Create a user identity for Azure Communication Services
export async function createChatUser(userId: string) {
  if (!communicationIdentityClient) {
    console.warn("Azure Communication Services not available - returning simulated user");
    return {
      communicationUserId: `simulated-${userId}`,
      token: "simulated-token",
      expiresOn: new Date(Date.now() + 24 * 60 * 60 * 1000),
      message: "Azure Communication Services connection string required for actual chat functionality"
    };
  }

  try {
    // Create a user
    const communicationUser = await communicationIdentityClient.createUser();
    
    // Issue a token for the user
    const tokenResponse = await communicationIdentityClient.getToken(
      communicationUser,
      ["chat", "voip"]
    );
    
    return {
      communicationUserId: communicationUser.communicationUserId,
      token: tokenResponse.token,
      expiresOn: tokenResponse.expiresOn
    };
  } catch (error: any) {
    console.error("Failed to create chat user:", error.message);
    throw new Error(`Failed to create chat user: ${error.message}`);
  }
}

// Create a chat thread for a user to connect with support
export async function createSupportChatThread(
  userDisplayName: string,
  userCommunicationId: string,
  supportDisplayName: string = "VA Support Agent",
  supportCommunicationId: string
) {
  if (!hasConnectionString) {
    console.warn("Azure Communication Services not available - returning simulated chat thread");
    const simulatedThreadId = `simulated-thread-${Date.now()}`;
    
    // Store in the active threads
    const userThreads = activeThreadsByUser.get(userCommunicationId) || [];
    userThreads.push({
      threadId: simulatedThreadId,
      participants: [
        { id: { communicationUserId: userCommunicationId }, displayName: userDisplayName },
        { id: { communicationUserId: supportCommunicationId }, displayName: supportDisplayName }
      ]
    });
    activeThreadsByUser.set(userCommunicationId, userThreads);
    
    return {
      threadId: simulatedThreadId,
      message: "Azure Communication Services connection string required for actual chat functionality"
    };
  }

  try {
    // Get user token
    const userCredential = new AzureCommunicationTokenCredential(
      process.env.AZURE_COMMUNICATION_USER_TOKEN as string
    );
    
    // Create chat client
    const chatClient = new ChatClient(
      process.env.AZURE_COMMUNICATION_ENDPOINT as string,
      userCredential
    );
    
    // Create a chat thread
    const createChatThreadOptions = {
      topic: `Support Chat for ${userDisplayName}`,
      participants: [
        {
          id: { communicationUserId: userCommunicationId },
          displayName: userDisplayName
        },
        {
          id: { communicationUserId: supportCommunicationId },
          displayName: supportDisplayName
        }
      ]
    };
    
    const createChatThreadResult = await chatClient.createChatThread(createChatThreadOptions);
    const threadId = createChatThreadResult.chatThread?.id;
    
    if (!threadId) {
      throw new Error("Failed to create chat thread - thread ID is undefined");
    }
    
    // Store in the active threads
    const userThreads = activeThreadsByUser.get(userCommunicationId) || [];
    userThreads.push({
      threadId,
      participants: createChatThreadOptions.participants
    });
    activeThreadsByUser.set(userCommunicationId, userThreads);
    
    return { threadId };
  } catch (error: any) {
    console.error("Failed to create support chat thread:", error.message);
    throw new Error(`Failed to create support chat thread: ${error.message}`);
  }
}

// Get all active chat threads for a user
export async function getUserChatThreads(userCommunicationId: string) {
  const userThreads = activeThreadsByUser.get(userCommunicationId) || [];
  return userThreads;
}

// Send a message to a chat thread
export async function sendChatMessage(
  threadId: string,
  senderCommunicationId: string,
  senderToken: string,
  content: string
) {
  if (!hasConnectionString) {
    console.warn("Azure Communication Services not available - simulating message send");
    return {
      id: `simulated-message-${Date.now()}`,
      type: "text",
      version: "1.0",
      content: {
        message: content,
        metadata: {
          senderId: senderCommunicationId,
          timestamp: new Date().toISOString()
        }
      },
      senderDisplayName: "Simulated User",
      createdOn: new Date(),
      message: "Azure Communication Services connection string required for actual chat functionality"
    };
  }

  try {
    // Create token credential
    const senderCredential = new AzureCommunicationTokenCredential(senderToken);
    
    // Create chat client
    const chatClient = new ChatClient(
      process.env.AZURE_COMMUNICATION_ENDPOINT as string,
      senderCredential
    );
    
    // Get the thread client
    const chatThreadClient = chatClient.getChatThreadClient(threadId);
    
    // Send the message
    const sendMessageOptions = {
      type: "text" as ChatMessageType,
      content: content
    };
    
    const sendMessageResult = await chatThreadClient.sendMessage(sendMessageOptions);
    return { messageId: sendMessageResult.id };
  } catch (error: any) {
    console.error("Failed to send chat message:", error.message);
    throw new Error(`Failed to send chat message: ${error.message}`);
  }
}

// Get chat messages from a thread
export async function getChatMessages(
  threadId: string,
  userToken: string,
  maxPageSize: number = 100
) {
  if (!hasConnectionString) {
    console.warn("Azure Communication Services not available - returning simulated messages");
    return {
      messages: [
        {
          id: "simulated-message-1",
          type: "text",
          sequenceId: "1",
          version: "1.0",
          content: {
            message: "Welcome to Valor Assist! How can we help you today?",
            metadata: {}
          },
          senderDisplayName: "VA Support Agent",
          createdOn: new Date(Date.now() - 5 * 60 * 1000),
          metadata: {}
        }
      ],
      message: "Azure Communication Services connection string required for actual chat functionality"
    };
  }

  try {
    // Create token credential
    const userCredential = new AzureCommunicationTokenCredential(userToken);
    
    // Create chat client
    const chatClient = new ChatClient(
      process.env.AZURE_COMMUNICATION_ENDPOINT as string,
      userCredential
    );
    
    // Get the thread client
    const chatThreadClient = chatClient.getChatThreadClient(threadId);
    
    // Get messages
    const messages = [];
    const getMessagesOptions = { maxPageSize };
    
    for await (const message of chatThreadClient.listMessages(getMessagesOptions)) {
      messages.push(message);
    }
    
    return { messages };
  } catch (error: any) {
    console.error("Failed to get chat messages:", error.message);
    throw new Error(`Failed to get chat messages: ${error.message}`);
  }
}

// Add a participant to a chat thread
export async function addChatParticipant(
  threadId: string,
  adminToken: string,
  participantCommunicationId: string,
  participantDisplayName: string
) {
  if (!hasConnectionString) {
    console.warn("Azure Communication Services not available - simulating add participant");
    
    // Add to the active threads map
    const entries = Array.from(activeThreadsByUser.entries());
    for (const [userId, threads] of entries) {
      for (let i = 0; i < threads.length; i++) {
        if (threads[i].threadId === threadId) {
          threads[i].participants.push({
            id: { communicationUserId: participantCommunicationId },
            displayName: participantDisplayName
          });
          break;
        }
      }
    }
    
    return {
      message: "Azure Communication Services connection string required for actual chat functionality"
    };
  }

  try {
    // Create token credential for admin
    const adminCredential = new AzureCommunicationTokenCredential(adminToken);
    
    // Create chat client
    const chatClient = new ChatClient(
      process.env.AZURE_COMMUNICATION_ENDPOINT as string,
      adminCredential
    );
    
    // Get the thread client
    const chatThreadClient = chatClient.getChatThreadClient(threadId);
    
    // Add the participant
    const addParticipantsOptions = {
      participants: [
        {
          id: { communicationUserId: participantCommunicationId },
          displayName: participantDisplayName
        }
      ]
    };
    
    await chatThreadClient.addParticipants(addParticipantsOptions);
    
    // Add to the active threads map
    const entries = Array.from(activeThreadsByUser.entries());
    for (const [userId, threads] of entries) {
      for (let i = 0; i < threads.length; i++) {
        if (threads[i].threadId === threadId) {
          threads[i].participants.push(addParticipantsOptions.participants[0]);
          break;
        }
      }
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add chat participant:", error.message);
    throw new Error(`Failed to add chat participant: ${error.message}`);
  }
}

// Remove a participant from a chat thread
export async function removeChatParticipant(
  threadId: string,
  adminToken: string,
  participantCommunicationId: string
) {
  if (!hasConnectionString) {
    console.warn("Azure Communication Services not available - simulating remove participant");
    
    // Remove from the active threads map
    const entriesArray = Array.from(activeThreadsByUser.entries());
    for (const [userId, threads] of entriesArray) {
      for (let i = 0; i < threads.length; i++) {
        if (threads[i].threadId === threadId) {
          threads[i].participants = threads[i].participants.filter(
            (p: ChatParticipant) => {
              const userId = (p.id as any).communicationUserId;
              return userId !== participantCommunicationId;
            }
          );
          break;
        }
      }
    }
    
    return {
      message: "Azure Communication Services connection string required for actual chat functionality"
    };
  }

  try {
    // Create token credential for admin
    const adminCredential = new AzureCommunicationTokenCredential(adminToken);
    
    // Create chat client
    const chatClient = new ChatClient(
      process.env.AZURE_COMMUNICATION_ENDPOINT as string,
      adminCredential
    );
    
    // Get the thread client
    const chatThreadClient = chatClient.getChatThreadClient(threadId);
    
    // Remove the participant
    await chatThreadClient.removeParticipant({ communicationUserId: participantCommunicationId });
    
    // Remove from the active threads map
    const activeEntries = Array.from(activeThreadsByUser.entries());
    for (const [userId, threads] of activeEntries) {
      for (let i = 0; i < threads.length; i++) {
        if (threads[i].threadId === threadId) {
          threads[i].participants = threads[i].participants.filter(
            (p: ChatParticipant) => {
              const userId = (p.id as any).communicationUserId;
              return userId !== participantCommunicationId;
            }
          );
          break;
        }
      }
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to remove chat participant:", error.message);
    throw new Error(`Failed to remove chat participant: ${error.message}`);
  }
}

// Process message with bot
export async function processBotMessage(threadId: string, message: string) {
  // If Azure Communication Services chatBot is not available, create a fallback bot
  if (!chatBot) {
    console.log("Azure Communication Services not available, using fallback bot");
    
    // Create a simple fallback bot that doesn't require Azure services
    const fallbackBot = new VeteranAssistantBot("fallback-bot", "fallback-token", "");
    
    try {
      const botResponse = await fallbackBot.processMessage(message, threadId);
      console.log("Fallback bot processed message successfully:", botResponse);
      return botResponse;
    } catch (error: any) {
      console.error("Error with fallback bot:", error.message);
      return {
        response: "I'm sorry, but the AI assistant is currently unavailable. However, I can help you with basic VA claims information. Please try asking about claims status, filing new claims, or appeals process.",
        suggestions: ["Check claim status", "File new claim", "Appeals help", "Contact Support"],
        intent: "unavailable"
      };
    }
  }

  try {
    // Process the message with the bot
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
  } catch (error: any) {
    console.error("Error processing bot message:", error.message);
    return {
      response: "I apologize, but I encountered an error processing your message. Please try again or contact support if the issue persists.",
      suggestions: ["Contact Support", "Try Again"],
      intent: "error"
    };
  }
}