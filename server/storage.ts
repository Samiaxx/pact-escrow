import { db } from "./db";
import {
  escrows,
  type InsertEscrow,
  type Escrow
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // We keep these for structural compliance, even if unused for the PoC
  getEscrow(id: string): Promise<Escrow | undefined>;
  createEscrow(escrow: InsertEscrow): Promise<Escrow>;
}

export class DatabaseStorage implements IStorage {
  async getEscrow(id: string): Promise<Escrow | undefined> {
    const [escrow] = await db.select().from(escrows).where(eq(escrows.id, id));
    return escrow;
  }

  async createEscrow(insertEscrow: InsertEscrow): Promise<Escrow> {
    const [escrow] = await db.insert(escrows).values(insertEscrow).returning();
    return escrow;
  }
}

export const storage = new DatabaseStorage();
