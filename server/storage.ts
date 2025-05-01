import { 
  users, claims, documents, chatThreads, chatMessages, documentAnalysisResults, auditLogs,
  type User, type InsertUser,
  type Claim, type InsertClaim,
  type Document, type InsertDocument,
  type ChatThread, type InsertChatThread,
  type ChatMessage, type InsertChatMessage,
  type DocumentAnalysisResult, type InsertDocumentAnalysisResult,
  type AuditLog, type InsertAuditLog
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@shared/schema";

// Type for transactions
type TransactionDB = PostgresJsDatabase<typeof schema>;

// Full storage interface for Valor Assist
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(userId: number): Promise<User | undefined>;
  updateUserVerification(userId: number, isVerified: boolean): Promise<User | undefined>;
  
  // Claim operations
  getClaim(id: number): Promise<Claim | undefined>;
  getClaimsByUserId(userId: number): Promise<Claim[]>;
  createClaim(claim: InsertClaim): Promise<Claim>;
  updateClaimAnalysis(id: number, analysis: any): Promise<Claim | undefined>;
  
  // Transaction support
  transaction<T>(callback: (trx: TransactionDB) => Promise<T>): Promise<T>;
  
  // Document operations
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByClaimId(claimId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  
  // Chat operations
  getChatThread(id: number): Promise<ChatThread | undefined>;
  getChatThreadsByUserId(userId: number): Promise<ChatThread[]>;
  createChatThread(chatThread: InsertChatThread): Promise<ChatThread>;
  getChatMessages(threadId: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(chatMessage: InsertChatMessage): Promise<ChatMessage>;
  updateChatThreadStatus(threadId: string, status: string): Promise<ChatThread | undefined>;
  
  // Document analysis operations
  getDocumentAnalysisResult(id: number): Promise<DocumentAnalysisResult | undefined>;
  getDocumentAnalysisResultsByDocumentId(documentId: number): Promise<DocumentAnalysisResult[]>;
  createDocumentAnalysisResult(result: InsertDocumentAnalysisResult): Promise<DocumentAnalysisResult>;
  
  // Audit operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogsByUserId(userId: number, limit?: number): Promise<AuditLog[]>;
}

// Database implementation of the storage interface
export class DatabaseStorage implements IStorage {
  // Transaction support
  async transaction<T>(callback: (trx: TransactionDB) => Promise<T>): Promise<T> {
    // Since @neondatabase/serverless doesn't fully support the transaction API,
    // we implement a basic transaction pattern with error handling
    // In a production environment, this should be replaced with proper transaction support
    try {
      await db.execute(sql`BEGIN`);
      const result = await callback(db as unknown as TransactionDB);
      await db.execute(sql`COMMIT`);
      return result;
    } catch (error) {
      await db.execute(sql`ROLLBACK`);
      throw error;
    }
  }
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({ 
        ...insertUser,
        createdAt: new Date() 
      })
      .returning();
    return user;
  }
  
  async updateUserLastLogin(userId: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
  
  async updateUserVerification(userId: number, isVerified: boolean): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isVerified })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
  
  // Claim operations
  async getClaim(id: number): Promise<Claim | undefined> {
    const [claim] = await db.select().from(claims).where(eq(claims.id, id));
    return claim;
  }
  
  async getClaimsByUserId(userId: number): Promise<Claim[]> {
    return await db.select().from(claims).where(eq(claims.userId, userId));
  }
  
  async createClaim(claim: InsertClaim): Promise<Claim> {
    const now = new Date();
    const [newClaim] = await db
      .insert(claims)
      .values({
        ...claim,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return newClaim;
  }
  
  async updateClaimAnalysis(id: number, analysis: any): Promise<Claim | undefined> {
    const [updatedClaim] = await db
      .update(claims)
      .set({ aiAnalysis: analysis, updatedAt: new Date() })
      .where(eq(claims.id, id))
      .returning();
    return updatedClaim;
  }
  
  // Document operations
  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }
  
  async getDocumentsByClaimId(claimId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.claimId, claimId));
  }
  
  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db
      .insert(documents)
      .values({
        ...document,
        createdAt: new Date()
      })
      .returning();
    return newDocument;
  }
  
  // Chat operations
  async getChatThread(id: number): Promise<ChatThread | undefined> {
    const [thread] = await db.select().from(chatThreads).where(eq(chatThreads.id, id));
    return thread;
  }
  
  async getChatThreadsByUserId(userId: number): Promise<ChatThread[]> {
    return await db.select()
      .from(chatThreads)
      .where(eq(chatThreads.userId, userId))
      .orderBy(desc(chatThreads.createdAt));
  }
  
  async createChatThread(chatThread: InsertChatThread): Promise<ChatThread> {
    const [newThread] = await db
      .insert(chatThreads)
      .values({
        ...chatThread,
        createdAt: new Date()
      })
      .returning();
    return newThread;
  }
  
  async getChatMessages(threadId: string, limit: number = 100): Promise<ChatMessage[]> {
    return await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.threadId, threadId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }
  
  async createChatMessage(chatMessage: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values({
        ...chatMessage,
        createdAt: new Date()
      })
      .returning();
    return newMessage;
  }
  
  async updateChatThreadStatus(threadId: string, status: string): Promise<ChatThread | undefined> {
    const [updatedThread] = await db
      .update(chatThreads)
      .set({ 
        status,
        ...(status === 'closed' ? { closedAt: new Date() } : {})
      })
      .where(eq(chatThreads.threadId, threadId))
      .returning();
    return updatedThread;
  }
  
  // Document analysis operations
  async getDocumentAnalysisResult(id: number): Promise<DocumentAnalysisResult | undefined> {
    const [result] = await db.select().from(documentAnalysisResults).where(eq(documentAnalysisResults.id, id));
    return result;
  }
  
  async getDocumentAnalysisResultsByDocumentId(documentId: number): Promise<DocumentAnalysisResult[]> {
    return await db.select()
      .from(documentAnalysisResults)
      .where(eq(documentAnalysisResults.documentId, documentId))
      .orderBy(desc(documentAnalysisResults.createdAt));
  }
  
  async createDocumentAnalysisResult(result: InsertDocumentAnalysisResult): Promise<DocumentAnalysisResult> {
    const [newResult] = await db
      .insert(documentAnalysisResults)
      .values({
        ...result,
        createdAt: new Date()
      })
      .returning();
    return newResult;
  }
  
  // Audit operations
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [newLog] = await db
      .insert(auditLogs)
      .values({
        ...log,
        timestamp: new Date()
      })
      .returning();
    return newLog;
  }
  
  async getAuditLogsByUserId(userId: number, limit: number = 100): Promise<AuditLog[]> {
    return await db.select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit);
  }
}

// Initialize the database storage
export const storage = new DatabaseStorage();
