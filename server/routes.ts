// server/routes.ts
import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import WebSocket, { WebSocketServer } from "ws";

// Import Drizzle ORM functions and database schema
import { eq } from "drizzle-orm";
import { claims, auditLogs, insertClaimSchema } from "@shared/schema";

// Import your custom modules
import { storage } from "./storage";
import {
  analyzeClaimInfo,
  generateDocumentTemplate,
  generateChatResponse,
  searchLegalPrecedents,
  analyzeDocument,
  ChatMessage,
} from "./openai";
import { AzureOpenAIService } from "./azure-openai";
import {
  getClaimStatus,
  getPatientRecords,
  verifyVeteranStatus,
  getFacilityInfo,
  searchFacilities,
  getEducationBenefits,
} from "./va-api";
import { analyzeVADocument, extractVAClaimInfo } from "./document-analysis";
import { setupAuth } from "./auth";
import {
  createChatUser,
  createSupportChatThread,
  sendChatMessage,
  getChatMessages,
  processBotMessage,
} from "./azure-chat";

// Helper function to safely get the user ID from the request
function getUserId(req: Request): number | undefined {
  if (!req.user) return undefined;
  // This assumes passport attaches the user object with an 'id' property
  return (req.user as { id: number }).id;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Azure OpenAI service for fine-tuned responses
  const azureOpenAI = new AzureOpenAIService();
  
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "operational",
        openai: "configured",
        azure_openai: azureOpenAI.isAvailable() ? "available" : "fallback-mode"
      }
    });
  });

  // Claims API routes
  app.get("/api/claims", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(400).json({ message: "User ID not found" });
      }
      
      const userClaims = await storage.getClaimsByUserId(userId);
      return res.json(userClaims);
    } catch (error) {
      console.error('Error fetching claims:', error);
      return res.status(500).json({ message: "Failed to retrieve claims" });
    }
  });

  app.post("/api/claims", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(400).json({ message: "User ID not found" });
      }
      
      // Parse and validate the claim data
      const claimData = insertClaimSchema.parse({ ...req.body, userId });
      
      // Create the claim
      const newClaim = await storage.createClaim(claimData);
      
      // Create audit log
      await storage.createAuditLog({
        userId,
        action: "claim_created",
        resourceType: "claim", 
        resourceId: newClaim[0].id.toString(),
        ip: req.ip || "0.0.0.0",
        userAgent: req.get("User-Agent") || "Unknown",
        details: { claimType: claimData.claimType }
      });
      
      return res.status(201).json(newClaim[0]);
    } catch (error) {
      console.error('Error creating claim:', error);
      return res.status(400).json({ 
        message: "Failed to create claim", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/claims/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(400).json({ message: "User ID not found" });
      }
      
      const claimId = parseInt(req.params.id);
      if (isNaN(claimId)) {
        return res.status(400).json({ message: "Invalid claim ID" });
      }
      
      const claim = await storage.getClaimById(claimId, userId);
      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }
      
      return res.json(claim);
    } catch (error) {
      console.error('Error fetching claim:', error);
      return res.status(500).json({ message: "Failed to retrieve claim" });
    }
  });

  app.put("/api/claims/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(400).json({ message: "User ID not found" });
      }
      
      const claimId = parseInt(req.params.id);
      if (isNaN(claimId)) {
        return res.status(400).json({ message: "Invalid claim ID" });
      }
      
      // Verify the claim belongs to the user
      const existingClaim = await storage.getClaimById(claimId, userId);
      if (!existingClaim) {
        return res.status(404).json({ message: "Claim not found" });
      }
      
      // Update the claim
      const updatedClaim = await storage.updateClaim(claimId, req.body);
      
      // Create audit log
      await storage.createAuditLog({
        userId,
        action: "claim_updated",
        resourceType: "claim",
        resourceId: claimId.toString(),
        ip: req.ip || "0.0.0.0",
        userAgent: req.get("User-Agent") || "Unknown",
        details: { updateFields: Object.keys(req.body) }
      });
      
      return res.json(updatedClaim[0]);
    } catch (error) {
      console.error('Error updating claim:', error);
      return res.status(500).json({ message: "Failed to update claim" });
    }
  });

  app.delete("/api/claims/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(400).json({ message: "User ID not found" });
      }
      
      const claimId = parseInt(req.params.id);
      if (isNaN(claimId)) {
        return res.status(400).json({ message: "Invalid claim ID" });
      }
      
      // Verify the claim belongs to the user before deletion
      const existingClaim = await storage.getClaimById(claimId, userId);
      if (!existingClaim) {
        return res.status(404).json({ message: "Claim not found" });
      }
      
      await storage.deleteClaim(claimId);
      
      // Create audit log
      await storage.createAuditLog({
        userId,
        action: "claim_deleted",
        resourceType: "claim",
        resourceId: claimId.toString(),
        ip: req.ip || "0.0.0.0",
        userAgent: req.get("User-Agent") || "Unknown",
        details: { claimType: existingClaim.claimType }
      });
      
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting claim:', error);
      return res.status(500).json({ message: "Failed to delete claim" });
    }
  });

  // VA API proxy routes
  app.get("/api/va/claim-status/:fileNumber", async (req, res) => {
    try {
      const { fileNumber } = req.params;
      const claimStatus = await getClaimStatus(fileNumber);
      return res.json(claimStatus);
    } catch (error) {
      console.error("Error fetching claim status:", error);
      return res.status(500).json({ message: "Failed to retrieve claim status" });
    }
  });

  app.get("/api/va/medical-records/:fileNumber", async (req, res) => {
    try {
      const { fileNumber } = req.params;
      const medicalRecords = await getPatientRecords(fileNumber);
      return res.json(medicalRecords);
    } catch (error) {
      console.error("Error fetching medical records:", error);
      return res
        .status(500)
        .json({ message: "Failed to retrieve medical records" });
    }
  });

  app.post("/api/va/verify-veteran", async (req, res) => {
    try {
      const { ssn, lastName, dateOfBirth } = req.body;
      const verificationResult = await verifyVeteranStatus({
        ssn,
        lastName,
        dateOfBirth,
      });
      return res.json(verificationResult);
    } catch (error) {
      console.error("Error verifying veteran status:", error);
      return res
        .status(500)
        .json({ message: "Failed to verify veteran status" });
    }
  });

  app.get("/api/va/facilities/:facilityId", async (req, res) => {
    try {
      const { facilityId } = req.params;
      const facility = await getFacilityInfo(facilityId);
      return res.json(facility);
    } catch (error) {
      console.error("Error fetching facility info:", error);
      return res
        .status(500)
        .json({ message: "Failed to retrieve facility information" });
    }
  });

  app.get("/api/va/facilities", async (req, res) => {
    try {
      const { type, state, zip } = req.query;
      const facilities = await searchFacilities({
        type: type as string,
        state: state as string,
        zip: zip as string,
      });
      return res.json(facilities);
    } catch (error) {
      console.error("Error searching facilities:", error);
      return res
        .status(500)
        .json({ message: "Failed to search facilities" });
    }
  });

  app.get("/api/va/education-benefits/:fileNumber", async (req, res) => {
    try {
      const { fileNumber } = req.params;
      const educationBenefits = await getEducationBenefits(fileNumber);
      return res.json(educationBenefits);
    } catch (error) {
      console.error("Error fetching education benefits:", error);
      return res
        .status(500)
        .json({ message: "Failed to retrieve education benefits" });
    }
  });

  // AI Features API routes
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages, veteranContext } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res
          .status(400)
          .json({ message: "Valid messages array is required" });
      }
      const validMessages = messages.every(
        (msg) =>
          msg &&
          typeof msg.role === "string" &&
          ["user", "assistant", "system"].includes(msg.role) &&
          typeof msg.content === "string"
      );
      if (!validMessages) {
        return res.status(400).json({
          message:
            "Messages must have valid 'role' (user, assistant, or system) and 'content' properties",
        });
      }
      const response = await azureOpenAI.generateChatResponse(messages, veteranContext);
      if (req.isAuthenticated()) {
        const userId = getUserId(req);
        if (userId) {
          await storage.createAuditLog({
            userId,
            action: "ai_chat_interaction",
            resourceType: "ai_chat",
            resourceId: `chat-${Date.now()}`,
            ip: req.ip || "0.0.0.0",
            userAgent: req.get("User-Agent") || "Unknown",
            details: { messageCount: messages.length },
          });
        }
      }
      return res.json({
        response,
        metadata: {
          model: "gpt-4.1-nano (fine-tuned)",
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      console.error("Error in AI chat:", error);
      return res.status(500).json({
        message: "Failed to generate AI response",
        error: error.message,
      });
    }
  });

  app.post("/api/ai/analyze-claim", async (req, res) => {
    try {
      const claimData = req.body;
      const analysis = await analyzeClaimInfo(claimData);
      if (req.isAuthenticated()) {
        const userId = getUserId(req);
        if (userId) {
          await storage.createAuditLog({
            userId,
            action: "ai_claim_analysis",
            resourceType: "ai_analysis",
            resourceId: `analysis-${Date.now()}`,
            ip: req.ip || "0.0.0.0",
            userAgent: req.get("User-Agent") || "Unknown",
            details: { claimType: claimData.claimType },
          });
        }
      }
      return res.json(analysis);
    } catch (error: any) {
      console.error("Error analyzing claim:", error);
      return res.status(500).json({
        message: "Failed to analyze claim",
        error: error.message,
      });
    }
  });

  app.post("/api/ai/generate-document", async (req, res) => {
    try {
      const { templateType, claimData } = req.body;
      const document = await generateDocumentTemplate(templateType, claimData);
      if (req.isAuthenticated()) {
        const userId = getUserId(req);
        if (userId) {
          await storage.createAuditLog({
            userId,
            action: "ai_document_generation",
            resourceType: "ai_document",
            resourceId: `doc-${Date.now()}`,
            ip: req.ip || "0.0.0.0",
            userAgent: req.get("User-Agent") || "Unknown",
            details: { templateType },
          });
        }
      }
      return res.json({ document });
    } catch (error: any) {
      console.error("Error generating document:", error);
      return res.status(500).json({
        message: "Failed to generate document",
        error: error.message,
      });
    }
  });

  app.post("/api/ai/search-precedents", async (req, res) => {
    try {
      const claimDetails = req.body;
      const precedents = await searchLegalPrecedents(claimDetails);
      if (req.isAuthenticated()) {
        const userId = getUserId(req);
        if (userId) {
          await storage.createAuditLog({
            userId,
            action: "ai_precedent_search",
            resourceType: "ai_search",
            resourceId: `search-${Date.now()}`,
            ip: req.ip || "0.0.0.0",
            userAgent: req.get("User-Agent") || "Unknown",
            details: { claimType: claimDetails.claimType },
          });
        }
      }
      return res.json(precedents);
    } catch (error: any) {
      console.error("Error searching precedents:", error);
      return res.status(500).json({
        message: "Failed to search legal precedents",
        error: error.message,
      });
    }
  });

  app.post("/api/ai/analyze-document", async (req, res) => {
    try {
      const { documentContent, analysisType } = req.body;
      const analysis = await analyzeDocument(documentContent, analysisType);
      if (req.isAuthenticated()) {
        const userId = getUserId(req);
        if (userId) {
          await storage.createAuditLog({
            userId,
            action: "ai_document_analysis",
            resourceType: "ai_analysis",
            resourceId: `doc-analysis-${Date.now()}`,
            ip: req.ip || "0.0.0.0",
            userAgent: req.get("User-Agent") || "Unknown",
            details: { analysisType },
          });
        }
      }
      return res.json(analysis);
    } catch (error: any) {
      console.error("Error analyzing document:", error);
      return res.status(500).json({
        message: "Failed to analyze document",
        error: error.message,
      });
    }
  });

  // Azure Communication Services routes
  app.post("/api/chat/user", async (req, res) => {
    try {
      const { displayName } = req.body;
      const user = await createChatUser(displayName);
      return res.json(user);
    } catch (error: any) {
      console.error("Error creating chat user:", error);
      return res.status(500).json({
        message: "Failed to create chat user",
        error: error.message,
      });
    }
  });

  app.post("/api/chat/thread", async (req, res) => {
    try {
      const { topic, participantIds } = req.body;
      const thread = await createSupportChatThread(topic, participantIds);
      return res.json(thread);
    } catch (error: any) {
      console.error("Error creating chat thread:", error);
      return res.status(500).json({
        message: "Failed to create chat thread",
        error: error.message,
      });
    }
  });

  app.post("/api/chat/thread/:threadId/message", async (req, res) => {
    try {
      const { threadId } = req.params;
      const { senderId, content } = req.body;
      const message = await sendChatMessage(threadId, senderId, content);
      return res.json(message);
    } catch (error: any) {
      console.error("Error sending chat message:", error);
      return res.status(500).json({
        message: "Failed to send chat message",
        error: error.message,
      });
    }
  });

  app.get("/api/chat/thread/:threadId/messages", async (req, res) => {
    try {
      const { threadId } = req.params;
      const messages = await getChatMessages(threadId);
      return res.json(messages);
    } catch (error: any) {
      console.error("Error getting chat messages:", error);
      return res.status(500).json({
        message: "Failed to retrieve chat messages",
        error: error.message,
      });
    }
  });

  // Enhanced bot message processing endpoint with fallback
  app.post("/api/chat/bot/:threadId/process", async (req, res) => {
    try {
      const { threadId } = req.params;
      const { message } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({
          message: "Valid message string is required",
        });
      }

      // Try to process with Azure Chat service first
      try {
        const botResponse = await processBotMessage(threadId, message);
        return res.json({
          response: botResponse,
          source: "azure_communication_services",
          threadId,
          timestamp: new Date().toISOString(),
        });
      } catch (azureError) {
        console.warn(
          "Azure Communication Services unavailable, using fallback bot:",
          azureError
        );
        
        // Fallback to our AI service
        const messages: ChatMessage[] = [
          { role: "user", content: message }
        ];
        
        const fallbackResponse = await azureOpenAI.generateChatResponse(messages);
        
        return res.json({
          response: fallbackResponse,
          source: "fallback_ai_bot",
          threadId,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      console.error("Error in bot message processing:", error);
      return res.status(500).json({
        message: "Failed to process bot message",
        error: error.message,
      });
    }
  });

  // Document analysis endpoints
  app.post("/api/documents/analyze-va", async (req, res) => {
    try {
      const { documentContent } = req.body;
      const analysis = await analyzeVADocument(documentContent);
      return res.json(analysis);
    } catch (error: any) {
      console.error("Error analyzing VA document:", error);
      return res.status(500).json({
        message: "Failed to analyze VA document",
        error: error.message,
      });
    }
  });

  app.post("/api/documents/extract-claim-info", async (req, res) => {
    try {
      const { documentContent } = req.body;
      const claimInfo = await extractVAClaimInfo(documentContent);
      return res.json(claimInfo);
    } catch (error: any) {
      console.error("Error extracting claim info:", error);
      return res.status(500).json({
        message: "Failed to extract claim information",
        error: error.message,
      });
    }
  });

  // WebSocket server for real-time features
  const server = createServer();
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("New websocket connection established");

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log("Received websocket message:", message.type);

        // Handle different message types
        switch (message.type) {
          case "ai_chat_request":
            // Validate message format
            if (!message.data?.messages || !Array.isArray(message.data.messages)) {
              ws.send(
                JSON.stringify({
                  type: "ai_chat_error",
                  error: "Messages array is required",
                })
              );
              return;
            }

            const validMessages = message.data.messages.every(
              (msg: any) =>
                msg &&
                typeof msg.role === "string" &&
                ["user", "assistant", "system"].includes(msg.role) &&
                typeof msg.content === "string"
            );

            if (!validMessages) {
              ws.send(
                JSON.stringify({
                  type: "ai_chat_error",
                  error: "Messages must have valid role and content properties",
                })
              );
              return;
            }

            ws.send(JSON.stringify({
              type: "ai_chat_typing",
              status: "started",
            }));

            const response = await azureOpenAI.generateChatResponse(
              data.messages as ChatMessage[],
              data.veteranContext
            );

            ws.send(
              JSON.stringify({
                type: "ai_chat_response",
                response,
                requestId: data.requestId,
                metadata: {
                  model: "gpt-4.1-nano (fine-tuned)",
                  timestamp: new Date().toISOString(),
                },
              })
            );

            if (data.userId) {
              try {
                await storage.createAuditLog({
                  userId: parseInt(data.userId),
                  action: "ai_chat_websocket",
                  resourceType: "ai_chat",
                  resourceId: `chat-${Date.now()}`,
                  ip: "websocket",
                  userAgent: "websocket",
                  details: { messageCount: data.messages.length },
                });
              } catch (auditError) {
                console.error("Error creating audit log:", auditError);
              }
            }
            break;

          case "ping":
            ws.send(JSON.stringify({ type: "pong" }));
            break;

          default:
            ws.send(
              JSON.stringify({
                type: "error",
                error: `Unknown message type: ${message.type}`,
              })
            );
        }
      } catch (error) {
        console.error("Error processing websocket message:", error);
        ws.send(
          JSON.stringify({
            type: "error",
            error: "Failed to process message",
          })
        );
      }
    });

    ws.on("close", () => {
      console.log("Websocket connection closed");
    });

    ws.on("error", (error) => {
      console.error("Websocket error:", error);
    });

    // Send welcome message
    ws.send(
      JSON.stringify({
        type: "welcome",
        message: "Connected to ValorAssist WebSocket server",
      })
    );
  });

  // Setup authentication routes
  setupAuth(app);

  // Start the server
  const PORT = process.env.PORT || 8080;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server ready`);
    console.log(`Azure OpenAI: ${azureOpenAI.isAvailable() ? 'Available (Fine-tuned)' : 'Fallback Mode'}`);
  });

  return server;
}