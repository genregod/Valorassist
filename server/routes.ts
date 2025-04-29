import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertClaimSchema } from "@shared/schema";
import { analyzeClaimInfo, generateDocumentTemplate } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoints
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

  const httpServer = createServer(app);

  return httpServer;
}
