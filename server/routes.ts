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
} from "./azure-chat";

// Helper function to safely get the user ID from the request
function getUserId(req: Request): number | undefined {
  if (!req.user) return undefined;
  // This assumes passport attaches the user object with an 'id' property
  return (req.user as { id: number }).id;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Authentication
  setupAuth(app);

  // Claims API routes
  app.post("/api/claims", async (req, res) => {
    try {
      const validationResult = insertClaimSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid claim data",
          errors: validationResult.error.format(),
        });
      }

      const userId = getUserId(req);
      const claimData = {
        ...validationResult.data,
        userId: userId || null,
      };

      const result = await storage.transaction(async (trx) => {
        const [claim] = await trx
          .insert(claims) // This is now correctly imported
          .values({
            ...claimData,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        try {
          const analysis = await analyzeClaimInfo(claimData);
          const [updatedClaim] = await trx
            .update(claims) // This is now correctly imported
            .set({
              aiAnalysis: analysis,
              updatedAt: new Date(),
            })
            .where(eq(claims.id, claim.id)) // 'eq' is now correctly imported
            .returning();

          if (userId) {
            await trx
              .insert(auditLogs) // This is now correctly imported
              .values({
                userId,
                action: "create_claim",
                resourceType: "claim",
                resourceId: claim.id.toString(),
                ip: req.ip || "0.0.0.0",
                userAgent: req.get("User-Agent") || "Unknown",
                details: {
                  claimTypes: claim.claimTypes,
                  withAnalysis: true,
                },
                timestamp: new Date(),
              });
          }
          return {
            success: true,
            claim: updatedClaim,
            analysis,
            withAnalysis: true,
          };
        } catch (aiError) {
          console.error("AI analysis failed:", aiError);
          if (userId) {
            await trx
              .insert(auditLogs) // This is now correctly imported
              .values({
                userId,
                action: "create_claim",
                resourceType: "claim",
                resourceId: claim.id.toString(),
                ip: req.ip || "0.0.0.0",
                userAgent: req.get("User-Agent") || "Unknown",
                details: {
                  claimTypes: claim.claimTypes,
                  withAnalysis: false,
                  error: "AI analysis failed",
                },
                timestamp: new Date(),
              });
          }
          return {
            success: true,
            claim,
            withAnalysis: false,
          };
        }
      });

      if (result.withAnalysis) {
        return res.status(201).json({
          message: "Claim submitted successfully",
          claim: { ...result.claim, analysis: result.analysis },
        });
      } else {
        return res.status(201).json({
          message: "Claim submitted successfully, but analysis is pending",
          claim: result.claim,
        });
      }
    } catch (error) {
      console.error("Error creating claim:", error);
      return res
        .status(500)
        .json({ message: "Failed to process claim submission" });
    }
  });

  app.get("/api/claims/:id", async (req, res) => {
    try {
      const claimId = parseInt(req.params.id);
      if (isNaN(claimId)) {
        return res.status(400).json({ message: "Invalid claim ID" });
      }
      const claim = await storage.getClaim(claimId);
      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }
      return res.json(claim);
    } catch (error) {
      console.error("Error retrieving claim:", error);
      return res.status(500).json({ message: "Failed to retrieve claim" });
    }
  });

  // Documents API routes
  app.post("/api/claims/:id/documents", async (req, res) => {
    try {
      const claimId = parseInt(req.params.id);
      if (isNaN(claimId)) {
        return res.status(400).json({ message: "Invalid claim ID" });
      }
      const claim = await storage.getClaim(claimId);
      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }
      const { name, type } = req.body;
      if (!name || !type) {
        return res
          .status(400)
          .json({ message: "Document name and type are required" });
      }
      const content = await generateDocumentTemplate(type, claim);
      const document = await storage.createDocument({
        claimId,
        name,
        type,
        content,
      });
      return res
        .status(201)
        .json({ message: "Document created successfully", document });
    } catch (error) {
      console.error("Error creating document:", error);
      return res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.get("/api/claims/:id/documents", async (req, res) => {
    try {
      const claimId = parseInt(req.params.id);
      if (isNaN(claimId)) {
        return res.status(400).json({ message: "Invalid claim ID" });
      }
      const documents = await storage.getDocumentsByClaimId(claimId);
      return res.json(documents);
    } catch (error) {
      console.error("Error retrieving documents:", error);
      return res.status(500).json({ message: "Failed to retrieve documents" });
    }
  });

  // VA API Integration routes
  app.get("/api/va/claims/:claimId", async (req, res) => {
    try {
      const { claimId } = req.params;
      const { ssn } = req.query;
      if (!ssn || typeof ssn !== "string") {
        return res
          .status(400)
          .json({ message: "SSN is required as a query parameter" });
      }
      const claimStatus = await getClaimStatus(claimId, ssn);
      return res.json(claimStatus);
    } catch (error) {
      console.error("Error fetching VA claim status:", error);
      return res
        .status(500)
        .json({ message: "Failed to retrieve VA claim status" });
    }
  });

  app.get("/api/va/patient/:icn", async (req, res) => {
    try {
      const { icn } = req.params;
      const patientRecords = await getPatientRecords(icn);
      return res.json(patientRecords);
    } catch (error) {
      console.error("Error fetching VA patient records:", error);
      return res
        .status(500)
        .json({ message: "Failed to retrieve VA patient records" });
    }
  });

  app.post("/api/va/verify", async (req, res) => {
    try {
      const { ssn, firstName, lastName, birthDate } = req.body;
      if (!ssn || !firstName || !lastName || !birthDate) {
        return res.status(400).json({
          message: "SSN, firstName, lastName, and birthDate are required",
        });
      }
      const verificationResult = await verifyVeteranStatus(
        ssn,
        firstName,
        lastName,
        birthDate
      );
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
      const facilityInfo = await getFacilityInfo(facilityId);
      return res.json(facilityInfo);
    } catch (error) {
      console.error("Error fetching VA facility information:", error);
      return res
        .status(500)
        .json({ message: "Failed to retrieve VA facility information" });
    }
  });

  app.get("/api/va/facilities", async (req, res) => {
    try {
      const { lat, long, radius } = req.query;
      if (!lat || !long) {
        return res.status(400).json({
          message:
            "Latitude (lat) and longitude (long) are required query parameters",
        });
      }
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(long as string);
      const searchRadius = radius ? parseInt(radius as string) : 50;
      if (isNaN(latitude) || isNaN(longitude)) {
        return res
          .status(400)
          .json({ message: "Invalid latitude or longitude values" });
      }
      const facilities = await searchFacilities(
        latitude,
        longitude,
        searchRadius
      );
      return res.json(facilities);
    } catch (error) {
      console.error("Error searching VA facilities:", error);
      return res.status(500).json({ message: "Failed to search VA facilities" });
    }
  });

  app.get("/api/va/education/:fileNumber", async (req, res) => {
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
      const response = await generateChatResponse(messages, veteranContext);
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
          model: "gpt-4o",
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error generating AI chat response:", error);
      return res.status(500).json({ message: "Failed to generate AI response" });
    }
  });

  app.post("/api/ai/legal-precedents", async (req, res) => {
    try {
      const { claimDetails } = req.body;
      if (!claimDetails) {
        return res.status(400).json({ message: "Claim details are required" });
      }
      const precedents = await searchLegalPrecedents(claimDetails);
      if (req.isAuthenticated()) {
        const userId = getUserId(req);
        if (userId) {
          await storage.createAuditLog({
            userId,
            action: "legal_precedent_search",
            resourceType: "legal_search",
            resourceId: `search-${Date.now()}`,
            ip: req.ip || "0.0.0.0",
            userAgent: req.get("User-Agent") || "Unknown",
            details: { claimType: claimDetails.claimType || "Unknown" },
          });
        }
      }
      return res.json(precedents);
    } catch (error) {
      console.error("Error searching legal precedents:", error);
      return res
        .status(500)
        .json({ message: "Failed to search legal precedents" });
    }
  });

  app.post("/api/ai/document-analysis", async (req, res) => {
    try {
      const { documentText, documentType } = req.body;
      if (!documentText) {
        return res.status(400).json({ message: "Document text is required" });
      }
      const analysis = await analyzeDocument(documentText, documentType);
      if (req.isAuthenticated()) {
        const userId = getUserId(req);
        if (userId) {
          await storage.createAuditLog({
            userId,
            action: "document_analysis",
            resourceType: "document",
            resourceId: `doc-${Date.now()}`,
            ip: req.ip || "0.0.0.0",
            userAgent: req.get("User-Agent") || "Unknown",
            details: {
              documentType: documentType || "Unknown",
              textLength: documentText.length,
            },
          });
        }
      }
      return res.json(analysis);
    } catch (error) {
      console.error("Error analyzing document:", error);
      return res.status(500).json({ message: "Failed to analyze document" });
    }
  });

  // Document Analysis API routes
  app.post("/api/document-analysis", async (req, res) => {
    try {
      const { documentUrl, documentType } = req.body;
      if (!documentUrl) {
        return res.status(400).json({ message: "Document URL is required" });
      }
      const analysisResult = await analyzeVADocument(documentUrl, documentType);
      return res.json(analysisResult);
    } catch (error) {
      console.error("Error analyzing document:", error);
      return res.status(500).json({ message: "Failed to analyze document" });
    }
  });

  app.post("/api/document-analysis/claim-info", async (req, res) => {
    try {
      const { documentUrl } = req.body;
      if (!documentUrl) {
        return res.status(400).json({ message: "Document URL is required" });
      }
      const claimInfo = await extractVAClaimInfo(documentUrl);
      return res.json(claimInfo);
    } catch (error) {
      console.error("Error extracting claim info from document:", error);
      return res
        .status(500)
        .json({ message: "Failed to extract claim information from document" });
    }
  });

  // Chat API routes
  app.post("/api/chat/users", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const reqUserId = getUserId(req);
      if (!reqUserId) {
        return res.status(401).json({ message: "Invalid user" });
      }
      const userId = reqUserId.toString();
      const chatUser = await createChatUser(userId);
      await storage.createAuditLog({
        userId: reqUserId,
        action: "create_chat_user",
        resourceType: "chat_user",
        resourceId: chatUser.communicationUserId,
        ip: req.ip || "0.0.0.0",
        userAgent: req.get("User-Agent") || "Unknown",
        details: { communicationUserId: chatUser.communicationUserId },
      });
      return res.status(201).json(chatUser);
    } catch (error) {
      console.error("Error creating chat user:", error);
      return res.status(500).json({ message: "Failed to create chat user" });
    }
  });

  app.post("/api/chat/threads", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Invalid user" });
      }
      const {
        userDisplayName,
        userCommunicationId,
        supportDisplayName,
        supportCommunicationId,
        topic,
      } = req.body;
      if (!userCommunicationId || !supportCommunicationId) {
        return res.status(400).json({
          message: "userCommunicationId and supportCommunicationId are required",
        });
      }
      const username =
        req.user && "username" in req.user
          ? (req.user as { username: string }).username
          : "User";
      const chatThread = await createSupportChatThread(
        userDisplayName || username,
        userCommunicationId,
        supportDisplayName || "VA Support Agent",
        supportCommunicationId
      );
      const threadData = await storage.createChatThread({
        threadId: chatThread.threadId,
        topic: topic || `Support chat for ${userDisplayName || username}`,
        userId: userId,
        status: "active",
      });
      await storage.createAuditLog({
        userId,
        action: "create_chat_thread",
        resourceType: "chat_thread",
        resourceId: chatThread.threadId,
        ip: req.ip || "0.0.0.0",
        userAgent: req.get("User-Agent") || "Unknown",
        details: { threadId: chatThread.threadId },
      });
      return res.status(201).json({
        ...chatThread,
        ...threadData,
      });
    } catch (error) {
      console.error("Error creating chat thread:", error);
      return res.status(500).json({ message: "Failed to create chat thread" });
    }
  });

  app.post("/api/chat/threads/:threadId/messages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Invalid user" });
      }
      const { threadId } = req.params;
      const { senderCommunicationId, senderToken, content } = req.body;
      if (!senderCommunicationId || !senderToken || !content) {
        return res.status(400).json({
          message: "senderCommunicationId, senderToken, and content are required",
        });
      }
      const message = await sendChatMessage(
        threadId,
        senderCommunicationId,
        senderToken,
        content
      );
      const messageData = await storage.createChatMessage({
        threadId,
        messageId: message.messageId || `local-${Date.now()}`,
        senderId: senderCommunicationId,
        content,
        type: "text",
      });
      await storage.createAuditLog({
        userId,
        action: "send_chat_message",
        resourceType: "chat_message",
        resourceId: messageData.messageId,
        ip: req.ip || "0.0.0.0",
        userAgent: req.get("User-Agent") || "Unknown",
        details: { threadId, messageId: messageData.messageId },
      });
      return res.status(201).json({
        ...message,
        ...messageData,
      });
    } catch (error) {
      console.error("Error sending chat message:", error);
      return res.status(500).json({ message: "Failed to send chat message" });
    }
  });

  app.get("/api/chat/threads/:threadId/messages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { threadId } = req.params;
      const { userToken, limit } = req.query;
      if (!userToken || typeof userToken !== "string") {
        return res
          .status(400)
          .json({ message: "userToken is required as a query parameter" });
      }
      const maxResults = limit ? parseInt(limit as string) : 100;
      const messages = await getChatMessages(threadId, userToken, maxResults);
      const localMessages = await storage.getChatMessages(threadId, maxResults);
      return res.json({
        messages: messages.messages || localMessages,
      });
    } catch (error) {
      console.error("Error retrieving chat messages:", error);
      return res
        .status(500)
        .json({ message: "Failed to retrieve chat messages" });
    }
  });

  app.get("/api/chat/threads", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Invalid user" });
      }
      const threads = await storage.getChatThreadsByUserId(userId);
      return res.json({ threads });
    } catch (error) {
      console.error("Error retrieving chat threads:", error);
      return res
        .status(500)
        .json({ message: "Failed to retrieve chat threads" });
    }
  });

  // Server setup
  const httpServer = createServer(app);

  // Set up WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === "chat_message") {
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: "chat_message",
                  threadId: data.threadId,
                  message: data.message,
                })
              );
            }
          });
        } else if (data.type === "ai_chat") {
          try {
            if (!data.messages || !Array.isArray(data.messages)) {
              ws.send(
                JSON.stringify({
                  type: "ai_chat_error",
                  error: "Invalid messages format",
                })
              );
              return;
            }

            const validMessages = data.messages.every(
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

            const response = await generateChatResponse(
              data.messages as ChatMessage[],
              data.veteranContext
            );

            ws.send(
              JSON.stringify({
                type: "ai_chat_response",
                response,
                requestId: data.requestId,
                metadata: {
                  model: "gpt-4o",
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
              } catch (logError) {
                console.error("Error creating audit log:", logError);
              }
            }
          } catch (aiError) {
            console.error("Error in AI chatbot interaction:", aiError);
            ws.send(
              JSON.stringify({
                type: "ai_chat_error",
                error: "Failed to generate AI response",
                requestId: data.requestId,
              })
            );
          }
        } else if (data.type === "analyze_document") {
          try {
            if (!data.documentText) {
              ws.send(
                JSON.stringify({
                  type: "document_analysis_error",
                  error: "Document text is required",
                  requestId: data.requestId,
                })
              );
              return;
            }

            const analysis = await analyzeDocument(
              data.documentText,
              data.documentType
            );

            ws.send(
              JSON.stringify({
                type: "document_analysis_result",
                analysis,
                requestId: data.requestId,
                metadata: {
                  timestamp: new Date().toISOString(),
                },
              })
            );
          } catch (docError) {
            console.error("Error in document analysis:", docError);
            ws.send(
              JSON.stringify({
                type: "document_analysis_error",
                error: "Failed to analyze document",
                requestId: data.requestId,
              })
            );
          }
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });

  return httpServer;
}
