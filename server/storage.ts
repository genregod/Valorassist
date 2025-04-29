import { 
  users, claims, documents,
  type User, type InsertUser,
  type Claim, type InsertClaim,
  type Document, type InsertDocument 
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// Full storage interface for Valor Assist
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Claim operations
  getClaim(id: number): Promise<Claim | undefined>;
  getClaimsByUserId(userId: number): Promise<Claim[]>;
  createClaim(claim: InsertClaim): Promise<Claim>;
  updateClaimAnalysis(id: number, analysis: any): Promise<Claim | undefined>;
  
  // Document operations
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByClaimId(claimId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
}

// Database implementation of the storage interface
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
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
}

// Initialize the database storage
export const storage = new DatabaseStorage();
