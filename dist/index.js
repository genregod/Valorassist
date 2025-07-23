var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";
import path3 from "path";

// server/routes.ts
import { createServer } from "http";
import WebSocket, { WebSocketServer } from "ws";
import { eq as eq2 } from "drizzle-orm";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  auditLogs: () => auditLogs,
  auditLogsRelations: () => auditLogsRelations,
  chatMessages: () => chatMessages,
  chatMessagesRelations: () => chatMessagesRelations,
  chatThreads: () => chatThreads,
  chatThreadsRelations: () => chatThreadsRelations,
  claims: () => claims,
  claimsRelations: () => claimsRelations,
  documentAnalysisResults: () => documentAnalysisResults,
  documentAnalysisResultsRelations: () => documentAnalysisResultsRelations,
  documents: () => documents,
  documentsRelations: () => documentsRelations,
  insertAuditLogSchema: () => insertAuditLogSchema,
  insertChatMessageSchema: () => insertChatMessageSchema,
  insertChatThreadSchema: () => insertChatThreadSchema,
  insertClaimSchema: () => insertClaimSchema,
  insertDocumentAnalysisResultSchema: () => insertDocumentAnalysisResultSchema,
  insertDocumentSchema: () => insertDocumentSchema,
  insertUserSchema: () => insertUserSchema,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").unique(),
  phone: text("phone"),
  role: text("role").default("user").notNull(),
  // user, admin, vso
  isVerified: boolean("is_verified").default(false),
  status: text("status").default("active"),
  azureAdId: text("azure_ad_id"),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at")
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  role: true,
  isVerified: true,
  status: true,
  azureAdId: true
});
var claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  branch: text("branch").notNull(),
  serviceStart: text("service_start").notNull(),
  serviceEnd: text("service_end"),
  dischargeType: text("discharge_type").notNull(),
  claimTypes: text("claim_types").array().notNull(),
  claimDescription: text("claim_description").notNull(),
  previousClaim: text("previous_claim").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  aiAnalysis: jsonb("ai_analysis")
});
var insertClaimSchema = createInsertSchema(claims).omit({
  id: true,
  userId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  aiAnalysis: true
});
var documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  claimId: integer("claim_id").notNull().references(() => claims.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => {
  return {
    claimIdx: uniqueIndex("document_claim_idx").on(table.claimId, table.name),
    typeIdx: uniqueIndex("document_type_idx").on(table.type)
  };
});
var insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true
});
var chatThreads = pgTable("chat_threads", {
  id: serial("id").primaryKey(),
  threadId: text("thread_id").notNull().unique(),
  topic: text("topic").notNull(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  supportUserId: integer("support_user_id").references(() => users.id, { onDelete: "set null" }),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  closedAt: timestamp("closed_at")
}, (table) => {
  return {
    userIdx: uniqueIndex("chat_thread_user_idx").on(table.userId),
    statusIdx: uniqueIndex("chat_thread_status_idx").on(table.status),
    createdAtIdx: uniqueIndex("chat_thread_created_at_idx").on(table.createdAt)
  };
});
var chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  threadId: text("thread_id").notNull().references(() => chatThreads.threadId, { onDelete: "cascade" }),
  messageId: text("message_id").notNull().unique(),
  senderId: text("sender_id").notNull(),
  content: text("content").notNull(),
  type: text("type").default("text"),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => {
  return {
    threadIdx: uniqueIndex("chat_message_thread_idx").on(table.threadId),
    createdAtIdx: uniqueIndex("chat_message_created_at_idx").on(table.createdAt)
  };
});
var documentAnalysisResults = pgTable("document_analysis_results", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  resultType: text("result_type").notNull(),
  confidenceScore: text("confidence_score"),
  extractedData: jsonb("extracted_data"),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => {
  return {
    documentResultTypeIdx: uniqueIndex("doc_analysis_result_doc_type_idx").on(table.documentId, table.resultType)
  };
});
var auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id"),
  details: jsonb("details"),
  ip: text("ip"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow()
}, (table) => {
  return {
    userActionIdx: uniqueIndex("audit_log_user_action_idx").on(table.userId, table.action),
    timestampIdx: uniqueIndex("audit_log_timestamp_idx").on(table.timestamp)
  };
});
var insertChatThreadSchema = createInsertSchema(chatThreads).omit({
  id: true,
  createdAt: true,
  closedAt: true
});
var insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true
});
var insertDocumentAnalysisResultSchema = createInsertSchema(documentAnalysisResults).omit({
  id: true,
  createdAt: true
});
var insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true
});
var usersRelations = relations(users, ({ many }) => ({
  claims: many(claims),
  chatThreads: many(chatThreads),
  auditLogs: many(auditLogs)
}));
var claimsRelations = relations(claims, ({ one, many }) => ({
  user: one(users, {
    fields: [claims.userId],
    references: [users.id]
  }),
  documents: many(documents)
}));
var documentsRelations = relations(documents, ({ one, many }) => ({
  claim: one(claims, {
    fields: [documents.claimId],
    references: [claims.id]
  }),
  analysisResults: many(documentAnalysisResults)
}));
var chatThreadsRelations = relations(chatThreads, ({ one, many }) => ({
  user: one(users, {
    fields: [chatThreads.userId],
    references: [users.id]
  }),
  supportUser: one(users, {
    fields: [chatThreads.supportUserId],
    references: [users.id]
  }),
  messages: many(chatMessages, {
    relationName: "threadMessages"
  })
}));
var chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  thread: one(chatThreads, {
    fields: [chatMessages.threadId],
    references: [chatThreads.threadId],
    relationName: "threadMessages"
  })
}));
var documentAnalysisResultsRelations = relations(documentAnalysisResults, ({ one }) => ({
  document: one(documents, {
    fields: [documentAnalysisResults.documentId],
    references: [documents.id]
  })
}));
var auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id]
  })
}));

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc, sql } from "drizzle-orm";
var DatabaseStorage = class {
  // Transaction support
  async transaction(callback) {
    try {
      await db.execute(sql`BEGIN`);
      const result = await callback(db);
      await db.execute(sql`COMMIT`);
      return result;
    } catch (error) {
      await db.execute(sql`ROLLBACK`);
      throw error;
    }
  }
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values({
      ...insertUser,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return user;
  }
  async updateUserLastLogin(userId) {
    const [user] = await db.update(users).set({ lastLoginAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId)).returning();
    return user;
  }
  async updateUserVerification(userId, isVerified) {
    const [user] = await db.update(users).set({ isVerified }).where(eq(users.id, userId)).returning();
    return user;
  }
  // Claim operations
  async getClaim(id) {
    const [claim] = await db.select().from(claims).where(eq(claims.id, id));
    return claim;
  }
  async getClaimsByUserId(userId) {
    return await db.select().from(claims).where(eq(claims.userId, userId));
  }
  async createClaim(claim) {
    const now = /* @__PURE__ */ new Date();
    const [newClaim] = await db.insert(claims).values({
      ...claim,
      createdAt: now,
      updatedAt: now
    }).returning();
    return newClaim;
  }
  async updateClaimAnalysis(id, analysis) {
    const [updatedClaim] = await db.update(claims).set({ aiAnalysis: analysis, updatedAt: /* @__PURE__ */ new Date() }).where(eq(claims.id, id)).returning();
    return updatedClaim;
  }
  // Document operations
  async getDocument(id) {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }
  async getDocumentsByClaimId(claimId) {
    return await db.select().from(documents).where(eq(documents.claimId, claimId));
  }
  async createDocument(document) {
    const [newDocument] = await db.insert(documents).values({
      ...document,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return newDocument;
  }
  // Chat operations
  async getChatThread(id) {
    const [thread] = await db.select().from(chatThreads).where(eq(chatThreads.id, id));
    return thread;
  }
  async getChatThreadsByUserId(userId) {
    return await db.select().from(chatThreads).where(eq(chatThreads.userId, userId)).orderBy(desc(chatThreads.createdAt));
  }
  async createChatThread(chatThread) {
    const [newThread] = await db.insert(chatThreads).values({
      ...chatThread,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return newThread;
  }
  async getChatMessages(threadId, limit = 100) {
    return await db.select().from(chatMessages).where(eq(chatMessages.threadId, threadId)).orderBy(desc(chatMessages.createdAt)).limit(limit);
  }
  async createChatMessage(chatMessage) {
    const [newMessage] = await db.insert(chatMessages).values({
      ...chatMessage,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return newMessage;
  }
  async updateChatThreadStatus(threadId, status) {
    const [updatedThread] = await db.update(chatThreads).set({
      status,
      ...status === "closed" ? { closedAt: /* @__PURE__ */ new Date() } : {}
    }).where(eq(chatThreads.threadId, threadId)).returning();
    return updatedThread;
  }
  // Document analysis operations
  async getDocumentAnalysisResult(id) {
    const [result] = await db.select().from(documentAnalysisResults).where(eq(documentAnalysisResults.id, id));
    return result;
  }
  async getDocumentAnalysisResultsByDocumentId(documentId) {
    return await db.select().from(documentAnalysisResults).where(eq(documentAnalysisResults.documentId, documentId)).orderBy(desc(documentAnalysisResults.createdAt));
  }
  async createDocumentAnalysisResult(result) {
    const [newResult] = await db.insert(documentAnalysisResults).values({
      ...result,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return newResult;
  }
  // Audit operations
  async createAuditLog(log) {
    const [newLog] = await db.insert(auditLogs).values({
      ...log,
      timestamp: /* @__PURE__ */ new Date()
    }).returning();
    return newLog;
  }
  async getAuditLogsByUserId(userId, limit = 100) {
    return await db.select().from(auditLogs).where(eq(auditLogs.userId, userId)).orderBy(desc(auditLogs.timestamp)).limit(limit);
  }
};
var storage = new DatabaseStorage();

// server/openai.ts
import OpenAI from "openai";
var hasOpenAIKey = !!process.env.OPENAI_API_KEY;
var openai = null;
if (hasOpenAIKey) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else {
  console.warn("OpenAI API key not found. AI features will be disabled.");
}
var VA_CLAIMS_SYSTEM_PROMPT = `You are Val, an AI assistant for the Valor Assist platform specializing in VA benefits and claims. 
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
function safeJsonParse(jsonString) {
  if (!jsonString) return {};
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing JSON response:", error);
    return {};
  }
}
function convertToOpenAIMessages(messages) {
  return messages.map((msg) => ({
    role: msg.role,
    content: msg.content
  }));
}
async function analyzeClaimInfo(claimData) {
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
          content: "You are an AI assistant specializing in VA claims analysis. Analyze the provided claim information and provide actionable recommendations. Return a JSON object with the following structure: { 'eligibility': number (0-100), 'recommendations': string[], 'missingEvidence': string[], 'nextSteps': string[] }"
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
  } catch (error) {
    console.error("Error analyzing claim:", error);
    throw new Error(`Failed to analyze claim: ${error.message}`);
  }
}
async function generateDocumentTemplate(claimType, claimData) {
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
- Service Period: ${claimData.serviceStart} to ${claimData.serviceEnd || "Present"}
- Discharge Type: ${claimData.dischargeType}

## Claim Description:
${claimData.claimDescription}

## Instructions:
Please complete this template with all relevant information. For personalized assistance,
enable AI-powered document generation by adding your OpenAI API key.
    `;
  }
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant specializing in VA documentation. Generate a document template for the specified claim type using the provided claim information. Format the document appropriately for VA submission."
        },
        {
          role: "user",
          content: `Claim Type: ${claimType}
Claim Data: ${JSON.stringify(claimData)}`
        }
      ]
    });
    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error generating document template:", error);
    throw new Error(`Failed to generate document template: ${error.message}`);
  }
}
async function generateChatResponse(messages, veteranContext) {
  if (!openai || !hasOpenAIKey) {
    console.warn("OpenAI API unavailable for chat - using fallback response");
    return "I'm sorry, but the AI assistant is currently unavailable. Please try again later or contact support for assistance with your VA benefits questions.";
  }
  try {
    const systemMessage = {
      role: "system",
      content: VA_CLAIMS_SYSTEM_PROMPT + (veteranContext ? `

Veteran Context:
${JSON.stringify(veteranContext)}` : "")
    };
    const apiMessages = [
      systemMessage,
      ...convertToOpenAIMessages(messages)
    ];
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: apiMessages,
      temperature: 0.7,
      // Balanced between creativity and accuracy
      max_tokens: 1e3
      // Reasonable response length
    });
    return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try rephrasing your question.";
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new Error(`Failed to generate chat response: ${error.message}`);
  }
}
async function searchLegalPrecedents(claimDetails) {
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI legal assistant specializing in VA claims law. Based on the claim details, identify relevant BVA decisions and case precedents that might apply. For each case, provide a case ID (docket number format), brief summary, relevance explanation, and date. Return a JSON object with a 'relevantCases' array containing these details."
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
  } catch (error) {
    console.error("Error searching legal precedents:", error);
    throw new Error(`Failed to search legal precedents: ${error.message}`);
  }
}
async function analyzeDocument(documentText, documentType) {
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI document analyzer specializing in VA claims documentation. Analyze the provided document text and extract key information relevant to VA claims. Determine the document's relevance to VA claims processes on a scale of 0-100. Return a JSON object with 'relevance' (number), 'keyInformation' (object of key-value pairs), and 'suggestedAction' (string)."
        },
        {
          role: "user",
          content: `Document Type: ${documentType || "Unknown"}
Document Text: ${documentText}`
        }
      ],
      response_format: { type: "json_object" }
    });
    const content = response.choices[0].message.content || "{}";
    return safeJsonParse(content);
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw new Error(`Failed to analyze document: ${error.message}`);
  }
}

// server/va-api.ts
import axios from "axios";
var hasBenefitsApiKey = !!process.env.VA_BENEFITS_API_KEY;
var hasHealthApiKey = !!process.env.VA_HEALTH_API_KEY;
var hasVerificationApiKey = !!process.env.VA_VERIFICATION_API_KEY;
var BENEFITS_API_URL = "https://sandbox-api.va.gov/services/benefits/v1";
var HEALTH_API_URL = "https://sandbox-api.va.gov/services/fhir/v0/r4";
var VERIFICATION_API_URL = "https://sandbox-api.va.gov/services/veteran_verification/v1";
async function getClaimStatus(claimId, ssn) {
  if (!hasBenefitsApiKey) {
    console.warn("VA Benefits API key missing - returning placeholder data");
    return {
      id: claimId,
      status: "PENDING",
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString(),
      type: "DISABILITY COMPENSATION",
      message: "VA API key required for live claim status"
    };
  }
  try {
    const response = await axios.get(`${BENEFITS_API_URL}/claims/${claimId}`, {
      headers: {
        "apiKey": process.env.VA_BENEFITS_API_KEY,
        "X-VA-SSN": ssn,
        "Content-Type": "application/json"
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching claim status:", error.message);
    throw new Error("Failed to retrieve claim status from VA API");
  }
}
async function getPatientRecords(icn) {
  if (!hasHealthApiKey) {
    console.warn("VA Health API key missing - returning placeholder data");
    return {
      resourceType: "Patient",
      id: icn,
      meta: {
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      },
      name: [{ text: "API key required for actual patient data" }],
      message: "VA Health API key required for live patient records"
    };
  }
  try {
    const response = await axios.get(`${HEALTH_API_URL}/Patient/${icn}`, {
      headers: {
        "apiKey": process.env.VA_HEALTH_API_KEY,
        "Content-Type": "application/json"
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching patient records:", error.message);
    throw new Error("Failed to retrieve patient records from VA API");
  }
}
async function verifyVeteranStatus(ssn, firstName, lastName, birthDate) {
  if (!hasVerificationApiKey) {
    console.warn("VA Verification API key missing - returning placeholder data");
    return {
      status: "CONFIRMED",
      isVeteran: true,
      branchOfService: "Sample Branch",
      verifiedAt: (/* @__PURE__ */ new Date()).toISOString(),
      message: "VA Verification API key required for actual verification"
    };
  }
  try {
    const response = await axios.post(`${VERIFICATION_API_URL}/status`, {
      ssn,
      firstName,
      lastName,
      birthDate
    }, {
      headers: {
        "apiKey": process.env.VA_VERIFICATION_API_KEY,
        "Content-Type": "application/json"
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error verifying veteran status:", error.message);
    throw new Error("Failed to verify veteran status with VA API");
  }
}
async function getFacilityInfo(facilityId) {
  try {
    const response = await axios.get(`https://sandbox-api.va.gov/services/va_facilities/v1/facilities/${facilityId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching facility information:", error.message);
    throw new Error("Failed to retrieve facility information from VA API");
  }
}
async function searchFacilities(lat, long, radius = 50) {
  try {
    const response = await axios.get(`https://sandbox-api.va.gov/services/va_facilities/v1/facilities`, {
      params: {
        lat,
        long,
        radius
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error searching facilities:", error.message);
    throw new Error("Failed to search facilities with VA API");
  }
}
async function getEducationBenefits(fileNumber) {
  if (!hasBenefitsApiKey) {
    console.warn("VA Benefits API key missing - returning placeholder data");
    return {
      chapter33: {
        eligibleForBenefits: true,
        remainingEntitlement: "36 months",
        delimiting_date: "2030-01-01"
      },
      message: "VA API key required for live education benefits data"
    };
  }
  try {
    const response = await axios.get(`${BENEFITS_API_URL}/education/${fileNumber}`, {
      headers: {
        "apiKey": process.env.VA_BENEFITS_API_KEY,
        "Content-Type": "application/json"
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching education benefits:", error.message);
    throw new Error("Failed to retrieve education benefits from VA API");
  }
}

// server/document-analysis.ts
import axios2 from "axios";
var hasDocumentAnalysisKey = !!process.env.AZURE_DOCUMENT_ANALYSIS_KEY;
var hasDocumentAnalysisEndpoint = !!process.env.AZURE_DOCUMENT_ANALYSIS_ENDPOINT;
async function analyzeVADocument(documentUrl, documentType = "prebuilt-document") {
  if (!hasDocumentAnalysisKey || !hasDocumentAnalysisEndpoint) {
    console.warn("Azure Document Analysis credentials missing - returning basic analysis");
    return {
      status: "Simulated Analysis",
      documentType,
      content: "Azure Document Intelligence API key required for actual document analysis",
      fields: {},
      message: "Add Azure Document Intelligence API credentials for full document analysis capabilities"
    };
  }
  try {
    const operationLocation = await startDocumentAnalysis(documentUrl, documentType);
    let result = await getOperationResult(operationLocation);
    let status = result.status;
    while (status !== "succeeded" && status !== "failed") {
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      result = await getOperationResult(operationLocation);
      status = result.status;
    }
    if (status === "failed") {
      throw new Error("Document analysis operation failed");
    }
    return result.analyzeResult;
  } catch (error) {
    console.error("Error analyzing document:", error.message);
    throw new Error(`Document analysis failed: ${error.message}`);
  }
}
async function startDocumentAnalysis(documentUrl, modelId) {
  try {
    const response = await axios2.post(
      `${process.env.AZURE_DOCUMENT_ANALYSIS_ENDPOINT}/formrecognizer/documentModels/${modelId}:analyze?api-version=2023-07-31`,
      {
        urlSource: documentUrl
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": process.env.AZURE_DOCUMENT_ANALYSIS_KEY
        }
      }
    );
    return response.headers["operation-location"];
  } catch (error) {
    console.error("Error starting document analysis:", error.message);
    throw new Error("Failed to start document analysis");
  }
}
async function getOperationResult(operationLocation) {
  try {
    const response = await axios2.get(operationLocation, {
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.AZURE_DOCUMENT_ANALYSIS_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error getting operation result:", error.message);
    throw new Error("Failed to get document analysis result");
  }
}
async function extractVAClaimInfo(documentUrl) {
  const result = await analyzeVADocument(documentUrl, "prebuilt-document");
  let claimInfo = {
    claimNumber: findClaimNumber(result),
    veteranName: findVeteranName(result),
    serviceConnected: findServiceConnection(result),
    dispositions: findDispositions(result),
    effectiveDate: findEffectiveDate(result),
    raw: result
  };
  return claimInfo;
}
function findClaimNumber(documentResult) {
  if (!hasDocumentAnalysisKey) {
    return "API-KEY-REQUIRED-FOR-EXTRACTION";
  }
  try {
    const content = documentResult.content || "";
    const claimNumberMatch = content.match(/Claim #: (\d+)/i) || content.match(/Claim Number: (\d+)/i) || content.match(/C-file Number: (\d+)/i);
    return claimNumberMatch ? claimNumberMatch[1] : "Not found";
  } catch (error) {
    console.error("Error finding claim number:", error);
    return "Error extracting claim number";
  }
}
function findVeteranName(documentResult) {
  if (!hasDocumentAnalysisKey) {
    return "API-KEY-REQUIRED-FOR-EXTRACTION";
  }
  try {
    const content = documentResult.content || "";
    const nameMatch = content.match(/Veteran Name: ([A-Za-z\s]+)/i) || content.match(/Name: ([A-Za-z\s]+), Veteran/i);
    return nameMatch ? nameMatch[1].trim() : "Not found";
  } catch (error) {
    console.error("Error finding veteran name:", error);
    return "Error extracting veteran name";
  }
}
function findServiceConnection(documentResult) {
  if (!hasDocumentAnalysisKey) {
    return false;
  }
  try {
    const content = documentResult.content || "";
    return content.includes("Service-Connected") || content.includes("Service Connected") || content.includes("SC:") || content.includes("S/C");
  } catch (error) {
    console.error("Error determining service connection:", error);
    return false;
  }
}
function findDispositions(documentResult) {
  if (!hasDocumentAnalysisKey) {
    return ["API-KEY-REQUIRED-FOR-EXTRACTION"];
  }
  try {
    const content = documentResult.content || "";
    const dispositions = [];
    const lines = content.split("\n");
    let inDispositionSection = false;
    for (const line of lines) {
      if (line.includes("DISPOSITION") || line.includes("Decision:")) {
        inDispositionSection = true;
        continue;
      }
      if (inDispositionSection && line.trim() && !line.includes("Page") && !line.includes("Date")) {
        dispositions.push(line.trim());
      }
      if (inDispositionSection && (line.includes("EVIDENCE") || line.includes("REASONS"))) {
        inDispositionSection = false;
      }
    }
    return dispositions.length > 0 ? dispositions : ["Not found"];
  } catch (error) {
    console.error("Error finding dispositions:", error);
    return ["Error extracting dispositions"];
  }
}
function findEffectiveDate(documentResult) {
  if (!hasDocumentAnalysisKey) {
    return "API-KEY-REQUIRED-FOR-EXTRACTION";
  }
  try {
    const content = documentResult.content || "";
    const dateMatch = content.match(/Effective Date: (\d{2}\/\d{2}\/\d{4})/i) || content.match(/Effective: (\d{2}\/\d{2}\/\d{4})/i) || content.match(/Effective Date: ([A-Za-z]+ \d{1,2}, \d{4})/i);
    return dateMatch ? dateMatch[1] : "Not found";
  } catch (error) {
    console.error("Error finding effective date:", error);
    return "Error extracting effective date";
  }
}

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import connectPg from "connect-pg-simple";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const PostgresSessionStore = connectPg(session);
  const isProduction = process.env.NODE_ENV === "production";
  const sessionSecret = process.env.SESSION_SECRET || "valor-assist-dev-secret";
  const sessionSettings = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1e3,
      // 30 days
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? "strict" : "lax"
    },
    store: new PostgresSessionStore({
      pool,
      tableName: "sessions",
      createTableIfMissing: true
    })
  };
  app2.set("trust proxy", 1);
  app2.use(session(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) return done(null, false, { message: "Invalid username" });
        if (!await comparePasswords(password, user.password)) {
          return done(null, false, { message: "Invalid password" });
        }
        await storage.updateUserLastLogin(user.id);
        await storage.createAuditLog({
          userId: user.id,
          action: "login",
          resourceType: "user",
          resourceId: user.id.toString(),
          ip: "0.0.0.0",
          // This should be replaced with the actual IP in the request handler
          userAgent: "Unknown",
          // This should be replaced with the actual user agent in the request handler
          details: { method: "local" }
        });
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) return done(null, false);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      const hashedPassword = await hashPassword(req.body.password);
      const userData = {
        ...req.body,
        password: hashedPassword
      };
      const user = await storage.createUser(userData);
      await storage.createAuditLog({
        userId: user.id,
        action: "register",
        resourceType: "user",
        resourceId: user.id.toString(),
        ip: req.ip || "0.0.0.0",
        userAgent: req.get("User-Agent") || "Unknown",
        details: { method: "local" }
      });
      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        return res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ error: info?.message || "Authentication failed" });
      }
      req.login(user, (err2) => {
        if (err2) return next(err2);
        storage.createAuditLog({
          userId: user.id,
          action: "login",
          resourceType: "user",
          resourceId: user.id.toString(),
          ip: req.ip || "0.0.0.0",
          userAgent: req.get("User-Agent") || "Unknown",
          details: { method: "local" }
        }).catch(console.error);
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    const userId = req.user?.id;
    req.logout((err) => {
      if (err) return next(err);
      if (userId) {
        storage.createAuditLog({
          userId,
          action: "logout",
          resourceType: "user",
          resourceId: userId.toString(),
          ip: req.ip || "0.0.0.0",
          userAgent: req.get("User-Agent") || "Unknown",
          details: { method: "local" }
        }).catch(console.error);
      }
      req.session.destroy((err2) => {
        if (err2) return next(err2);
        res.clearCookie("connect.sid");
        return res.status(200).json({ success: true });
      });
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
  app2.use("/api/protected/*", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    next();
  });
}

// server/azure-chat.ts
import {
  ChatClient as ChatClient2
} from "@azure/communication-chat";
import { AzureCommunicationTokenCredential as AzureCommunicationTokenCredential2 } from "@azure/communication-common";
import { CommunicationIdentityClient as CommunicationIdentityClient2 } from "@azure/communication-identity";

// server/chat-bot.ts
import { ChatClient } from "@azure/communication-chat";
import { CommunicationIdentityClient } from "@azure/communication-identity";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";
var VeteranAssistantBot = class {
  botUserId;
  botToken;
  chatClient = null;
  constructor(botUserId, botToken, endpoint) {
    this.botUserId = botUserId;
    this.botToken = botToken;
    this.initializeChatClient(endpoint);
  }
  initializeChatClient(endpoint) {
    const tokenCredential = new AzureCommunicationTokenCredential(this.botToken);
    this.chatClient = new ChatClient(endpoint, tokenCredential);
  }
  // Analyze user message and determine intent
  analyzeIntent(message) {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes("claim") && (lowerMessage.includes("status") || lowerMessage.includes("check"))) {
      return "claim_status";
    } else if (lowerMessage.includes("file") || lowerMessage.includes("submit")) {
      return "file_claim";
    } else if (lowerMessage.includes("appeal")) {
      return "appeal_process";
    } else if (lowerMessage.includes("document") || lowerMessage.includes("evidence")) {
      return "documents";
    } else if (lowerMessage.includes("rating") || lowerMessage.includes("disability")) {
      return "disability_rating";
    } else if (lowerMessage.includes("help") || lowerMessage.includes("assist")) {
      return "general_help";
    } else if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "greeting";
    } else {
      return "unknown";
    }
  }
  // Generate bot response based on intent
  generateResponse(intent) {
    const responses = {
      greeting: {
        intent: "greeting",
        response: "Hello! I'm your VA Claims Assistant. I'm here to help you navigate the claims process. What can I help you with today?",
        suggestions: [
          "Check claim status",
          "File a new claim",
          "Upload documents",
          "Learn about appeals"
        ]
      },
      claim_status: {
        intent: "claim_status",
        response: "I can help you check your claim status. To get started, I'll need your claim number or we can look it up using your information. Would you like me to guide you through checking your claim status?",
        suggestions: [
          "Enter claim number",
          "Look up by SSN",
          "View recent claims"
        ]
      },
      file_claim: {
        intent: "file_claim",
        response: "I'll help you file a new claim. The process involves:\n1. Gathering medical evidence\n2. Completing VA Form 21-526EZ\n3. Submitting supporting documents\n\nWould you like me to walk you through each step?",
        suggestions: [
          "Start new claim",
          "Required documents",
          "Eligibility requirements"
        ]
      },
      appeal_process: {
        intent: "appeal_process",
        response: "If your claim was denied or you disagree with the rating, you have several appeal options:\n- Higher-Level Review\n- Supplemental Claim\n- Board Appeal\n\nWhich option would you like to learn more about?",
        suggestions: [
          "Higher-Level Review",
          "Supplemental Claim",
          "Board Appeal",
          "Appeal deadlines"
        ]
      },
      documents: {
        intent: "documents",
        response: "Supporting documents are crucial for your claim. Common documents include:\n- Medical records\n- Service treatment records\n- Nexus letters\n- Buddy statements\n\nDo you need help gathering or uploading any of these?",
        suggestions: [
          "Upload documents",
          "Required documents list",
          "Get medical records"
        ]
      },
      disability_rating: {
        intent: "disability_rating",
        response: "Your disability rating determines your compensation amount. Ratings range from 0% to 100% in 10% increments. Would you like to:\n- Understand how ratings are calculated?\n- Check current compensation rates?\n- Learn how to increase your rating?",
        suggestions: [
          "Rating calculator",
          "Compensation rates",
          "Increase rating"
        ]
      },
      general_help: {
        intent: "general_help",
        response: "I'm here to help with all aspects of your VA claims. Here are some things I can assist with:\n- Filing new claims\n- Checking claim status\n- Understanding the appeals process\n- Document preparation\n- Disability ratings\n\nWhat would you like help with?",
        suggestions: [
          "File a claim",
          "Check status",
          "Appeals help",
          "Documents"
        ]
      },
      unknown: {
        intent: "unknown",
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
  async processMessage(message, threadId) {
    const intent = this.analyzeIntent(message);
    const response = this.generateResponse(intent);
    console.log(`Bot processed message: "${message}" with intent: "${intent}"`);
    return response;
  }
  // Send message to chat thread
  async sendMessage(threadId, message) {
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
  isFromBot(senderId) {
    return senderId === this.botUserId;
  }
};
async function createBotUser(connectionString) {
  const identityClient = new CommunicationIdentityClient(connectionString);
  const user = await identityClient.createUser();
  const tokenResponse = await identityClient.getToken(user, ["chat"]);
  return {
    userId: user.communicationUserId,
    token: tokenResponse.token
  };
}

// server/azure-chat.ts
var hasConnectionString = !!process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
var communicationIdentityClient = null;
var chatBot = null;
if (hasConnectionString) {
  try {
    communicationIdentityClient = new CommunicationIdentityClient2(
      process.env.AZURE_COMMUNICATION_CONNECTION_STRING
    );
    console.log("Azure Communication Services client initialized");
    initializeBot();
  } catch (error) {
    console.error("Failed to initialize Azure Communication Services:", error.message);
  }
} else {
  console.warn("Azure Communication Services connection string is missing - chat functionality will be limited");
}
var activeThreadsByUser = /* @__PURE__ */ new Map();
async function initializeBot() {
  if (!hasConnectionString) return;
  try {
    const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
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
  } catch (error) {
    console.error("Failed to initialize chat bot:", error.message);
  }
}
async function createChatUser(userId) {
  if (!communicationIdentityClient) {
    console.warn("Azure Communication Services not available - returning simulated user");
    return {
      communicationUserId: `simulated-${userId}`,
      token: "simulated-token",
      expiresOn: new Date(Date.now() + 24 * 60 * 60 * 1e3),
      message: "Azure Communication Services connection string required for actual chat functionality"
    };
  }
  try {
    const communicationUser = await communicationIdentityClient.createUser();
    const tokenResponse = await communicationIdentityClient.getToken(
      communicationUser,
      ["chat", "voip"]
    );
    return {
      communicationUserId: communicationUser.communicationUserId,
      token: tokenResponse.token,
      expiresOn: tokenResponse.expiresOn
    };
  } catch (error) {
    console.error("Failed to create chat user:", error.message);
    throw new Error(`Failed to create chat user: ${error.message}`);
  }
}
async function createSupportChatThread(userDisplayName, userCommunicationId, supportDisplayName = "VA Support Agent", supportCommunicationId) {
  if (!hasConnectionString) {
    console.warn("Azure Communication Services not available - returning simulated chat thread");
    const simulatedThreadId = `simulated-thread-${Date.now()}`;
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
    const userCredential = new AzureCommunicationTokenCredential2(
      process.env.AZURE_COMMUNICATION_USER_TOKEN
    );
    const chatClient = new ChatClient2(
      process.env.AZURE_COMMUNICATION_ENDPOINT,
      userCredential
    );
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
    const userThreads = activeThreadsByUser.get(userCommunicationId) || [];
    userThreads.push({
      threadId,
      participants: createChatThreadOptions.participants
    });
    activeThreadsByUser.set(userCommunicationId, userThreads);
    return { threadId };
  } catch (error) {
    console.error("Failed to create support chat thread:", error.message);
    throw new Error(`Failed to create support chat thread: ${error.message}`);
  }
}
async function sendChatMessage(threadId, senderCommunicationId, senderToken, content) {
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
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }
      },
      senderDisplayName: "Simulated User",
      createdOn: /* @__PURE__ */ new Date(),
      message: "Azure Communication Services connection string required for actual chat functionality"
    };
  }
  try {
    const senderCredential = new AzureCommunicationTokenCredential2(senderToken);
    const chatClient = new ChatClient2(
      process.env.AZURE_COMMUNICATION_ENDPOINT,
      senderCredential
    );
    const chatThreadClient = chatClient.getChatThreadClient(threadId);
    const sendMessageOptions = {
      type: "text",
      content
    };
    const sendMessageResult = await chatThreadClient.sendMessage(sendMessageOptions);
    return { messageId: sendMessageResult.id };
  } catch (error) {
    console.error("Failed to send chat message:", error.message);
    throw new Error(`Failed to send chat message: ${error.message}`);
  }
}
async function getChatMessages(threadId, userToken, maxPageSize = 100) {
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
          createdOn: new Date(Date.now() - 5 * 60 * 1e3),
          metadata: {}
        }
      ],
      message: "Azure Communication Services connection string required for actual chat functionality"
    };
  }
  try {
    const userCredential = new AzureCommunicationTokenCredential2(userToken);
    const chatClient = new ChatClient2(
      process.env.AZURE_COMMUNICATION_ENDPOINT,
      userCredential
    );
    const chatThreadClient = chatClient.getChatThreadClient(threadId);
    const messages = [];
    const getMessagesOptions = { maxPageSize };
    for await (const message of chatThreadClient.listMessages(getMessagesOptions)) {
      messages.push(message);
    }
    return { messages };
  } catch (error) {
    console.error("Failed to get chat messages:", error.message);
    throw new Error(`Failed to get chat messages: ${error.message}`);
  }
}
async function processBotMessage(threadId, message) {
  if (!chatBot) {
    return {
      response: "I'm sorry, but the AI assistant is currently unavailable. Please try again later or contact support.",
      suggestions: ["Contact Support", "Try Again Later"],
      intent: "unavailable"
    };
  }
  try {
    const botResponse = await chatBot.processMessage(message, threadId);
    if (hasConnectionString && chatBot && !threadId.startsWith("thread-")) {
      try {
        await chatBot.sendMessage(threadId, botResponse.response);
      } catch (error) {
        console.error("Failed to send bot message to thread:", error);
      }
    }
    return botResponse;
  } catch (error) {
    console.error("Error processing bot message:", error.message);
    return {
      response: "I apologize, but I encountered an error processing your message. Please try again or contact support if the issue persists.",
      suggestions: ["Contact Support", "Try Again"],
      intent: "error"
    };
  }
}

// server/routes.ts
function getUserId(req) {
  if (!req.user) return void 0;
  return req.user.id;
}
async function registerRoutes(app2) {
  app2.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      services: {
        openai: !!process.env.OPENAI_API_KEY,
        azureCommunication: !!process.env.AZURE_COMMUNICATION_CONNECTION_STRING,
        database: !!process.env.DATABASE_URL
      }
    });
  });
  app2.get("/api/test", (req, res) => {
    res.json({
      message: "API is working correctly",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  setupAuth(app2);
  app2.post("/api/claims", async (req, res) => {
    try {
      const validationResult = insertClaimSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid claim data",
          errors: validationResult.error.format()
        });
      }
      const userId = getUserId(req);
      const claimData = {
        ...validationResult.data,
        userId: userId || null
      };
      const result = await storage.transaction(async (trx) => {
        const [claim] = await trx.insert(claims).values({
          ...claimData,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        try {
          const analysis = await analyzeClaimInfo(claimData);
          const [updatedClaim] = await trx.update(claims).set({
            aiAnalysis: analysis,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq2(claims.id, claim.id)).returning();
          if (userId) {
            await trx.insert(auditLogs).values({
              userId,
              action: "create_claim",
              resourceType: "claim",
              resourceId: claim.id.toString(),
              ip: req.ip || "0.0.0.0",
              userAgent: req.get("User-Agent") || "Unknown",
              details: {
                claimTypes: claim.claimTypes,
                withAnalysis: true
              },
              timestamp: /* @__PURE__ */ new Date()
            });
          }
          return {
            success: true,
            claim: updatedClaim,
            analysis,
            withAnalysis: true
          };
        } catch (aiError) {
          console.error("AI analysis failed:", aiError);
          if (userId) {
            await trx.insert(auditLogs).values({
              userId,
              action: "create_claim",
              resourceType: "claim",
              resourceId: claim.id.toString(),
              ip: req.ip || "0.0.0.0",
              userAgent: req.get("User-Agent") || "Unknown",
              details: {
                claimTypes: claim.claimTypes,
                withAnalysis: false,
                error: "AI analysis failed"
              },
              timestamp: /* @__PURE__ */ new Date()
            });
          }
          return {
            success: true,
            claim,
            withAnalysis: false
          };
        }
      });
      if (result.withAnalysis) {
        return res.status(201).json({
          message: "Claim submitted successfully",
          claim: { ...result.claim, analysis: result.analysis }
        });
      } else {
        return res.status(201).json({
          message: "Claim submitted successfully, but analysis is pending",
          claim: result.claim
        });
      }
    } catch (error) {
      console.error("Error creating claim:", error);
      return res.status(500).json({ message: "Failed to process claim submission" });
    }
  });
  app2.get("/api/claims/:id", async (req, res) => {
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
  app2.post("/api/claims/:id/documents", async (req, res) => {
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
      const content = await generateDocumentTemplate(type, claim);
      const document = await storage.createDocument({
        claimId,
        name,
        type,
        content
      });
      return res.status(201).json({ message: "Document created successfully", document });
    } catch (error) {
      console.error("Error creating document:", error);
      return res.status(500).json({ message: "Failed to create document" });
    }
  });
  app2.get("/api/claims/:id/documents", async (req, res) => {
    try {
      const claimId = parseInt(req.params.id);
      if (isNaN(claimId)) {
        return res.status(400).json({ message: "Invalid claim ID" });
      }
      const documents2 = await storage.getDocumentsByClaimId(claimId);
      return res.json(documents2);
    } catch (error) {
      console.error("Error retrieving documents:", error);
      return res.status(500).json({ message: "Failed to retrieve documents" });
    }
  });
  app2.get("/api/va/claims/:claimId", async (req, res) => {
    try {
      const { claimId } = req.params;
      const { ssn } = req.query;
      if (!ssn || typeof ssn !== "string") {
        return res.status(400).json({ message: "SSN is required as a query parameter" });
      }
      const claimStatus = await getClaimStatus(claimId, ssn);
      return res.json(claimStatus);
    } catch (error) {
      console.error("Error fetching VA claim status:", error);
      return res.status(500).json({ message: "Failed to retrieve VA claim status" });
    }
  });
  app2.get("/api/va/patient/:icn", async (req, res) => {
    try {
      const { icn } = req.params;
      const patientRecords = await getPatientRecords(icn);
      return res.json(patientRecords);
    } catch (error) {
      console.error("Error fetching VA patient records:", error);
      return res.status(500).json({ message: "Failed to retrieve VA patient records" });
    }
  });
  app2.post("/api/va/verify", async (req, res) => {
    try {
      const { ssn, firstName, lastName, birthDate } = req.body;
      if (!ssn || !firstName || !lastName || !birthDate) {
        return res.status(400).json({
          message: "SSN, firstName, lastName, and birthDate are required"
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
      return res.status(500).json({ message: "Failed to verify veteran status" });
    }
  });
  app2.get("/api/va/facilities/:facilityId", async (req, res) => {
    try {
      const { facilityId } = req.params;
      const facilityInfo = await getFacilityInfo(facilityId);
      return res.json(facilityInfo);
    } catch (error) {
      console.error("Error fetching VA facility information:", error);
      return res.status(500).json({ message: "Failed to retrieve VA facility information" });
    }
  });
  app2.get("/api/va/facilities", async (req, res) => {
    try {
      const { lat, long, radius } = req.query;
      if (!lat || !long) {
        return res.status(400).json({
          message: "Latitude (lat) and longitude (long) are required query parameters"
        });
      }
      const latitude = parseFloat(lat);
      const longitude = parseFloat(long);
      const searchRadius = radius ? parseInt(radius) : 50;
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ message: "Invalid latitude or longitude values" });
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
  app2.get("/api/va/education/:fileNumber", async (req, res) => {
    try {
      const { fileNumber } = req.params;
      const educationBenefits = await getEducationBenefits(fileNumber);
      return res.json(educationBenefits);
    } catch (error) {
      console.error("Error fetching education benefits:", error);
      return res.status(500).json({ message: "Failed to retrieve education benefits" });
    }
  });
  app2.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages, veteranContext } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "Valid messages array is required" });
      }
      const validMessages = messages.every(
        (msg) => msg && typeof msg.role === "string" && ["user", "assistant", "system"].includes(msg.role) && typeof msg.content === "string"
      );
      if (!validMessages) {
        return res.status(400).json({
          message: "Messages must have valid 'role' (user, assistant, or system) and 'content' properties"
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
            details: { messageCount: messages.length }
          });
        }
      }
      return res.json({
        response,
        metadata: {
          model: "gpt-4o",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
    } catch (error) {
      console.error("Error generating AI chat response:", error);
      return res.status(500).json({ message: "Failed to generate AI response" });
    }
  });
  app2.post("/api/ai/legal-precedents", async (req, res) => {
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
            details: { claimType: claimDetails.claimType || "Unknown" }
          });
        }
      }
      return res.json(precedents);
    } catch (error) {
      console.error("Error searching legal precedents:", error);
      return res.status(500).json({ message: "Failed to search legal precedents" });
    }
  });
  app2.post("/api/ai/document-analysis", async (req, res) => {
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
              textLength: documentText.length
            }
          });
        }
      }
      return res.json(analysis);
    } catch (error) {
      console.error("Error analyzing document:", error);
      return res.status(500).json({ message: "Failed to analyze document" });
    }
  });
  app2.post("/api/document-analysis", async (req, res) => {
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
  app2.post("/api/document-analysis/claim-info", async (req, res) => {
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
  app2.post("/api/chat/users", async (req, res) => {
    try {
      const userId = `guest-${Date.now()}`;
      const chatUser = await createChatUser(userId);
      return res.status(201).json(chatUser);
    } catch (error) {
      console.error("Error creating chat user:", error);
      return res.status(500).json({ message: "Failed to create chat user" });
    }
  });
  app2.post("/api/chat/threads", async (req, res) => {
    try {
      const {
        userDisplayName,
        userCommunicationId,
        supportDisplayName,
        supportCommunicationId,
        topic
      } = req.body;
      if (!userCommunicationId) {
        return res.status(400).json({
          message: "userCommunicationId is required"
        });
      }
      const chatThread = await createSupportChatThread(
        userDisplayName || "Guest User",
        userCommunicationId,
        supportDisplayName || "VA Support Agent",
        supportCommunicationId || "support-agent-001"
      );
      return res.status(201).json(chatThread);
    } catch (error) {
      console.error("Error creating chat thread:", error);
      return res.status(500).json({ message: "Failed to create chat thread" });
    }
  });
  app2.post("/api/chat/threads/:threadId/messages", async (req, res) => {
    try {
      const { threadId } = req.params;
      const { senderCommunicationId, senderToken, content } = req.body;
      if (!senderCommunicationId || !content) {
        return res.status(400).json({
          message: "senderCommunicationId and content are required"
        });
      }
      const message = await sendChatMessage(
        threadId,
        senderCommunicationId,
        senderToken || "simulated-token",
        content
      );
      return res.status(201).json(message);
    } catch (error) {
      console.error("Error sending chat message:", error);
      return res.status(500).json({ message: "Failed to send chat message" });
    }
  });
  app2.get("/api/chat/threads/:threadId/messages", async (req, res) => {
    try {
      const { threadId } = req.params;
      const { userToken, limit } = req.query;
      const maxResults = limit ? parseInt(limit) : 100;
      const messages = await getChatMessages(
        threadId,
        userToken || "simulated-token",
        maxResults
      );
      return res.json(messages);
    } catch (error) {
      console.error("Error retrieving chat messages:", error);
      return res.status(500).json({ message: "Failed to retrieve chat messages" });
    }
  });
  app2.get("/api/chat/threads", async (req, res) => {
    try {
      return res.json({ threads: [] });
    } catch (error) {
      console.error("Error retrieving chat threads:", error);
      return res.status(500).json({ message: "Failed to retrieve chat threads" });
    }
  });
  app2.post("/api/chat/bot/:threadId/process", async (req, res) => {
    try {
      const { threadId } = req.params;
      const { message } = req.body;
      if (!message || !threadId) {
        return res.status(400).json({
          message: "Message and threadId are required"
        });
      }
      const botResponse = await processBotMessage(threadId, message);
      return res.json(botResponse);
    } catch (error) {
      console.error("Error processing bot message:", error);
      return res.status(500).json({
        message: "Failed to process bot message"
      });
    }
  });
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  wss.on("connection", (ws2) => {
    console.log("WebSocket client connected");
    ws2.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "chat_message") {
          wss.clients.forEach((client) => {
            if (client !== ws2 && client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: "chat_message",
                  threadId: data.threadId,
                  message: data.message
                })
              );
            }
          });
        } else if (data.type === "ai_chat") {
          try {
            if (!data.messages || !Array.isArray(data.messages)) {
              ws2.send(
                JSON.stringify({
                  type: "ai_chat_error",
                  error: "Invalid messages format"
                })
              );
              return;
            }
            const validMessages = data.messages.every(
              (msg) => msg && typeof msg.role === "string" && ["user", "assistant", "system"].includes(msg.role) && typeof msg.content === "string"
            );
            if (!validMessages) {
              ws2.send(
                JSON.stringify({
                  type: "ai_chat_error",
                  error: "Messages must have valid role and content properties"
                })
              );
              return;
            }
            ws2.send(JSON.stringify({
              type: "ai_chat_typing",
              status: "started"
            }));
            const response = await generateChatResponse(
              data.messages,
              data.veteranContext
            );
            ws2.send(
              JSON.stringify({
                type: "ai_chat_response",
                response,
                requestId: data.requestId,
                metadata: {
                  model: "gpt-4o",
                  timestamp: (/* @__PURE__ */ new Date()).toISOString()
                }
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
                  details: { messageCount: data.messages.length }
                });
              } catch (logError) {
                console.error("Error creating audit log:", logError);
              }
            }
          } catch (aiError) {
            console.error("Error in AI chatbot interaction:", aiError);
            ws2.send(
              JSON.stringify({
                type: "ai_chat_error",
                error: "Failed to generate AI response",
                requestId: data.requestId
              })
            );
          }
        } else if (data.type === "analyze_document") {
          try {
            if (!data.documentText) {
              ws2.send(
                JSON.stringify({
                  type: "document_analysis_error",
                  error: "Document text is required",
                  requestId: data.requestId
                })
              );
              return;
            }
            const analysis = await analyzeDocument(
              data.documentText,
              data.documentType
            );
            ws2.send(
              JSON.stringify({
                type: "document_analysis_result",
                analysis,
                requestId: data.requestId,
                metadata: {
                  timestamp: (/* @__PURE__ */ new Date()).toISOString()
                }
              })
            );
          } catch (docError) {
            console.error("Error in document analysis:", docError);
            ws2.send(
              JSON.stringify({
                type: "document_analysis_error",
                error: "Failed to analyze document",
                requestId: data.requestId
              })
            );
          }
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    });
    ws2.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  // Add this server configuration block
  server: {
    hmr: {
      port: 5e3
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    // Add the port to the hmr configuration here
    hmr: { server, port: 5001 },
    // This is the corrected line
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}

// server/index.ts
import dotenv from "dotenv";
dotenv.config();
if (!process.env.OPENAI_API_KEY) {
  console.warn("OpenAI API key not found. AI features will be disabled.");
}
if (!process.env.AZURE_COMMUNICATION_CONNECTION_STRING) {
  console.warn(
    "Azure Communication Services connection string not found. Chat features will be limited."
  );
}
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      const duration = Date.now() - start;
      console.log(
        `[API] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
      );
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err);
  });
  const isProduction = process.env.NODE_ENV === "production";
  console.log(`Application starting in ${isProduction ? "Production" : "Development"} mode.`);
  if (isProduction) {
    const clientDistPath = path3.resolve(process.cwd(), "dist/public");
    console.log(`Serving static files from: ${clientDistPath}`);
    app.use(express2.static(clientDistPath));
    app.get("*", (req, res) => {
      res.sendFile(path3.resolve(clientDistPath, "index.html"));
    });
  } else {
    await setupVite(app, server);
  }
  const port = process.env.PORT || "8080";
  server.listen(
    {
      port: Number(port),
      host: "0.0.0.0"
    },
    () => {
      console.log(`Server listening on port ${port}`);
    }
  );
})();
