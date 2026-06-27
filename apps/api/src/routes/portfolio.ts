import { Router } from "express";
import { getPortfolio } from "../services/portfolioService.js";

export const portfolioRouter = Router();

portfolioRouter.get("/", async (_req, res) => {
  try {
    const portfolio = await getPortfolio();
    res.json(portfolio);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load portfolio";
    res.status(500).json({ error: message });
  }
});

portfolioRouter.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
