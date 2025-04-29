import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table - core user data
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").unique(),
  phone: text("phone"),
  role: text("role").default("user").notNull(), // user, admin, vso
  isVerified: boolean("is_verified").default(false),
  status: text("status").default("active"),
  azureAdId: text("azure_ad_id"),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  role: true,
  isVerified: true,
  status: true,
  azureAdId: true,
});

export const claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
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
  aiAnalysis: jsonb("ai_analysis"),
});

export const insertClaimSchema = createInsertSchema(claims).omit({
  id: true,
  userId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  aiAnalysis: true,
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  claimId: integer("claim_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type Claim = typeof claims.$inferSelect;

// Azure Communication Services chat data
export const chatThreads = pgTable("chat_threads", {
  id: serial("id").primaryKey(),
  threadId: text("thread_id").notNull().unique(),
  topic: text("topic").notNull(),
  userId: integer("user_id").notNull(),
  supportUserId: integer("support_user_id"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  closedAt: timestamp("closed_at"),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  threadId: text("thread_id").notNull(),
  messageId: text("message_id").notNull().unique(),
  senderId: text("sender_id").notNull(),
  content: text("content").notNull(),
  type: text("type").default("text"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Azure Document Analysis data
export const documentAnalysisResults = pgTable("document_analysis_results", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  resultType: text("result_type").notNull(),
  confidenceScore: text("confidence_score"),
  extractedData: jsonb("extracted_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Azure monitoring data
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id"),
  details: jsonb("details"),
  ip: text("ip"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Create insert schemas for the new tables
export const insertChatThreadSchema = createInsertSchema(chatThreads).omit({
  id: true,
  createdAt: true,
  closedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentAnalysisResultSchema = createInsertSchema(documentAnalysisResults).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});

// Define relationships between tables
export const usersRelations = relations(users, ({ many }) => ({
  claims: many(claims),
  chatThreads: many(chatThreads),
  auditLogs: many(auditLogs),
}));

export const claimsRelations = relations(claims, ({ one, many }) => ({
  user: one(users, {
    fields: [claims.userId],
    references: [users.id],
  }),
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  claim: one(claims, {
    fields: [documents.claimId],
    references: [claims.id],
  }),
  analysisResults: many(documentAnalysisResults),
}));

export const chatThreadsRelations = relations(chatThreads, ({ one, many }) => ({
  user: one(users, {
    fields: [chatThreads.userId],
    references: [users.id],
  }),
  supportUser: one(users, {
    fields: [chatThreads.supportUserId],
    references: [users.id],
  }),
  messages: many(chatMessages, {
    relationName: "threadMessages",
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  thread: one(chatThreads, {
    fields: [chatMessages.threadId],
    references: [chatThreads.threadId],
    relationName: "threadMessages",
  }),
}));

export const documentAnalysisResultsRelations = relations(documentAnalysisResults, ({ one }) => ({
  document: one(documents, {
    fields: [documentAnalysisResults.documentId],
    references: [documents.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type Claim = typeof claims.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertChatThread = z.infer<typeof insertChatThreadSchema>;
export type ChatThread = typeof chatThreads.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertDocumentAnalysisResult = z.infer<typeof insertDocumentAnalysisResultSchema>;
export type DocumentAnalysisResult = typeof documentAnalysisResults.$inferSelect;

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
