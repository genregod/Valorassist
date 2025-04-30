import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { z } from "zod";
import { insertClaimSchema } from "@shared/schema";
import { analyzeClaimInfo, generateDocumentTemplate } from "./openai";
import { 
  getClaimStatus, 
  getPatientRecords, 
  verifyVeteranStatus,
  getFacilityInfo,
  searchFacilities,
  getEducationBenefits
} from "./va-api";
import { analyzeVADocument, extractVAClaimInfo } from "./document-analysis";
import { setupAuth } from "./auth";
import { 
  createChatUser, 
  createSupportChatThread, 
  sendChatMessage, 
  getChatMessages 
} from "./azure-chat";

export async function registerRoutes(app: Express): Promise<Server> {
  // ----------------
  // Setup Authentication
  // ----------------
  setupAuth(app);
  
  // ----------------
  // Claims API routes
  // ----------------
  app.post("/api/claims", async (req, res) => {
    try {
      // Validate input data
      const validationResult = insertClaimSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid claim data", 
          errors: validationResult.error.format() 
        });
      }
      
      const claimData = validationResult.data;
      
      // Store claim in the database
      const claim = await storage.createClaim(claimData);
      
      // Perform AI analysis on the claim data
      try {
        const analysis = await analyzeClaimInfo(claimData);
        
        // Update the claim with AI analysis results
        await storage.updateClaimAnalysis(claim.id, analysis);
        
        // Return success with the created claim and analysis
        return res.status(201).json({ 
          message: "Claim submitted successfully", 
          claim: { ...claim, analysis }
        });
      } catch (aiError) {
        // If AI analysis fails, still save the claim but notify the client
        console.error("AI analysis failed:", aiError);
        
        return res.status(201).json({ 
          message: "Claim submitted successfully, but analysis is pending", 
          claim
        });
      }
    } catch (error) {
      console.error("Error creating claim:", error);
      return res.status(500).json({ message: "Failed to process claim submission" });
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
  
  // ----------------
  // Documents API routes
  // ----------------
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
        return res.status(400).json({ message: "Document name and type are required" });
      }
      
      // Generate document content based on claim data and document type
      const content = await generateDocumentTemplate(type, claim);
      
      const document = await storage.createDocument({
        claimId,
        name,
        type,
        content
      });
      
      return res.status(201).json({ 
        message: "Document created successfully", 
        document 
      });
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

  // ----------------
  // VA API Integration routes
  // ----------------
  
  // Get VA claim status
  app.get("/api/va/claims/:claimId", async (req, res) => {
    try {
      const { claimId } = req.params;
      const { ssn } = req.query;
      
      if (!ssn || typeof ssn !== 'string') {
        return res.status(400).json({ message: "SSN is required as a query parameter" });
      }
      
      const claimStatus = await getClaimStatus(claimId, ssn);
      return res.json(claimStatus);
    } catch (error) {
      console.error("Error fetching VA claim status:", error);
      return res.status(500).json({ message: "Failed to retrieve VA claim status" });
    }
  });
  
  // Get VA patient records
  app.get("/api/va/patient/:icn", async (req, res) => {
    try {
      const { icn } = req.params;
      const patientRecords = await getPatientRecords(icn);
      return res.json(patientRecords);
    } catch (error) {
      console.error("Error fetching VA patient records:", error);
      return res.status(500).json({ message: "Failed to retrieve VA patient records" });
    }
  });
  
  // Verify veteran status
  app.post("/api/va/verify", async (req, res) => {
    try {
      const { ssn, firstName, lastName, birthDate } = req.body;
      
      if (!ssn || !firstName || !lastName || !birthDate) {
        return res.status(400).json({ 
          message: "SSN, firstName, lastName, and birthDate are required" 
        });
      }
      
      const verificationResult = await verifyVeteranStatus(
        ssn, firstName, lastName, birthDate
      );
      
      return res.json(verificationResult);
    } catch (error) {
      console.error("Error verifying veteran status:", error);
      return res.status(500).json({ message: "Failed to verify veteran status" });
    }
  });
  
  // Get VA facility information
  app.get("/api/va/facilities/:facilityId", async (req, res) => {
    try {
      const { facilityId } = req.params;
      const facilityInfo = await getFacilityInfo(facilityId);
      return res.json(facilityInfo);
    } catch (error) {
      console.error("Error fetching VA facility information:", error);
      return res.status(500).json({ message: "Failed to retrieve VA facility information" });
    }
  });
  
  // Search VA facilities by location
  app.get("/api/va/facilities", async (req, res) => {
    try {
      const { lat, long, radius } = req.query;
      
      if (!lat || !long) {
        return res.status(400).json({ 
          message: "Latitude (lat) and longitude (long) are required query parameters" 
        });
      }
      
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(long as string);
      const searchRadius = radius ? parseInt(radius as string) : 50;
      
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ message: "Invalid latitude or longitude values" });
      }
      
      const facilities = await searchFacilities(latitude, longitude, searchRadius);
      return res.json(facilities);
    } catch (error) {
      console.error("Error searching VA facilities:", error);
      return res.status(500).json({ message: "Failed to search VA facilities" });
    }
  });
  
  // Get education benefits
  app.get("/api/va/education/:fileNumber", async (req, res) => {
    try {
      const { fileNumber } = req.params;
      const educationBenefits = await getEducationBenefits(fileNumber);
      return res.json(educationBenefits);
    } catch (error) {
      console.error("Error fetching education benefits:", error);
      return res.status(500).json({ message: "Failed to retrieve education benefits" });
    }
  });
  
  // ----------------
  // Document Analysis API routes
  // ----------------
  
  // Analyze VA document
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
  
  // Extract VA claim information from document
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
      return res.status(500).json({ message: "Failed to extract claim information from document" });
    }
  });

  // ----------------
  // Chat API routes
  // ----------------
  
  // Create chat user
  app.post("/api/chat/users", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user?.id.toString();
      
      if (!userId) {
        return res.status(401).json({ message: "Invalid user" });
      }
      
      // Create chat user
      const chatUser = await createChatUser(userId);
      
      // Create audit log
      await storage.createAuditLog({
        userId: req.user.id,
        action: "create_chat_user",
        resourceType: "chat_user",
        resourceId: chatUser.communicationUserId,
        ip: req.ip || "0.0.0.0",
        userAgent: req.get("User-Agent") || "Unknown",
        details: { communicationUserId: chatUser.communicationUserId }
      });
      
      return res.status(201).json(chatUser);
    } catch (error) {
      console.error("Error creating chat user:", error);
      return res.status(500).json({ message: "Failed to create chat user" });
    }
  });
  
  // Create support chat thread
  app.post("/api/chat/threads", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Invalid user" });
      }
      
      const { 
        userDisplayName, 
        userCommunicationId, 
        supportDisplayName, 
        supportCommunicationId,
        topic
      } = req.body;
      
      if (!userCommunicationId || !supportCommunicationId) {
        return res.status(400).json({ 
          message: "userCommunicationId and supportCommunicationId are required" 
        });
      }
      
      // Create chat thread
      const chatThread = await createSupportChatThread(
        userDisplayName || req.user.username,
        userCommunicationId,
        supportDisplayName || "VA Support Agent",
        supportCommunicationId
      );
      
      // Store the thread in our database
      const threadData = await storage.createChatThread({
        threadId: chatThread.threadId,
        topic: topic || `Support chat for ${userDisplayName || req.user.username}`,
        userId: userId,
        status: "active"
      });
      
      // Create audit log
      await storage.createAuditLog({
        userId: req.user.id,
        action: "create_chat_thread",
        resourceType: "chat_thread",
        resourceId: chatThread.threadId,
        ip: req.ip || "0.0.0.0",
        userAgent: req.get("User-Agent") || "Unknown",
        details: { threadId: chatThread.threadId }
      });
      
      return res.status(201).json({
        ...chatThread,
        ...threadData
      });
    } catch (error) {
      console.error("Error creating chat thread:", error);
      return res.status(500).json({ message: "Failed to create chat thread" });
    }
  });
  
  // Send chat message
  app.post("/api/chat/threads/:threadId/messages", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { threadId } = req.params;
      const { senderCommunicationId, senderToken, content } = req.body;
      
      if (!senderCommunicationId || !senderToken || !content) {
        return res.status(400).json({ 
          message: "senderCommunicationId, senderToken, and content are required" 
        });
      }
      
      // Send the message
      const message = await sendChatMessage(
        threadId,
        senderCommunicationId,
        senderToken,
        content
      );
      
      // Store the message in our database
      const messageData = await storage.createChatMessage({
        threadId,
        messageId: message.messageId || `local-${Date.now()}`,
        senderId: senderCommunicationId,
        content,
        type: "text"
      });
      
      // Create audit log
      await storage.createAuditLog({
        userId: req.user.id,
        action: "send_chat_message",
        resourceType: "chat_message",
        resourceId: messageData.messageId,
        ip: req.ip || "0.0.0.0",
        userAgent: req.get("User-Agent") || "Unknown",
        details: { threadId, messageId: messageData.messageId }
      });
      
      return res.status(201).json({
        ...message,
        ...messageData
      });
    } catch (error) {
      console.error("Error sending chat message:", error);
      return res.status(500).json({ message: "Failed to send chat message" });
    }
  });
  
  // Get chat messages
  app.get("/api/chat/threads/:threadId/messages", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { threadId } = req.params;
      const { userToken, limit } = req.query;
      
      if (!userToken || typeof userToken !== 'string') {
        return res.status(400).json({ message: "userToken is required as a query parameter" });
      }
      
      const maxResults = limit ? parseInt(limit as string) : 100;
      
      // Get the messages from Azure
      const messages = await getChatMessages(
        threadId,
        userToken,
        maxResults
      );
      
      // Also get the locally stored messages as a fallback
      const localMessages = await storage.getChatMessages(threadId, maxResults);
      
      // Return the messages, giving preference to Azure if available
      return res.json({
        messages: messages.messages || localMessages
      });
    } catch (error) {
      console.error("Error retrieving chat messages:", error);
      return res.status(500).json({ message: "Failed to retrieve chat messages" });
    }
  });
  
  // Get user chat threads
  app.get("/api/chat/threads", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Invalid user" });
      }
      
      // Get the threads from our database
      const threads = await storage.getChatThreadsByUserId(userId);
      
      return res.json({ threads });
    } catch (error) {
      console.error("Error retrieving chat threads:", error);
      return res.status(500).json({ message: "Failed to retrieve chat threads" });
    }
  });
  
  // ----------------
  // Server setup
  // ----------------

  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', async (message) => {
      try {
        // Parse the message
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        if (data.type === 'chat_message') {
          // Broadcast the message to all connected clients
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'chat_message',
                threadId: data.threadId,
                message: data.message
              }));
            }
          });
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}
