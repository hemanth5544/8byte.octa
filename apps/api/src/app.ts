import cors from "cors";
import express, { type Express } from "express";
import { portfolioRouter } from "./routes/portfolio.js";

export async function createApp(): Promise<Express> {
  const app = express();
  app.use(
    cors({
      origin: process.env.VERCEL_URL
        ? [`https://${process.env.VERCEL_URL}`, process.env.VERCEL_BRANCH_URL ?? ""].filter(Boolean)
        : ["http://localhost:5173", "http://127.0.0.1:5173"],
    }),
  );
  app.use(express.json());

  app.use("/portfolio", portfolioRouter);
  app.use("/api/portfolio", portfolioRouter);

  return app;
}

let appPromise: Promise<Express> | null = null;

export function getApp(): Promise<Express> {
  appPromise ??= createApp();
  return appPromise;
}
