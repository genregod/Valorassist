import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
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

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
