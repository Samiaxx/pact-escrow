import { pgTable, text, serial, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We define the schema here mainly to generate types for the frontend
// The actual state will live on the Kadena blockchain

export const escrows = pgTable("escrows", {
  id: text("id").primaryKey(), // The Offer ID
  creator: text("creator").notNull(), // Wallet A
  buyer: text("buyer"), // Wallet B
  arbiter: text("arbiter"),
  amount: numeric("amount").notNull(),
  state: text("state").notNull(), // CREATED, ACCEPTED, FUNDED, PAID, COMPLETED, REFUNDED
  txnHash: text("txn_hash"), // Last relevant transaction hash
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEscrowSchema = createInsertSchema(escrows);

export type Escrow = typeof escrows.$inferSelect;
export type InsertEscrow = z.infer<typeof insertEscrowSchema>;
