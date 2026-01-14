import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Routes are primarily handled by the frontend talking to the blockchain directly
  // We can add a simple health check or config route if needed

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", network: "kadena-mainnet" });
  });

  return httpServer;
}
