import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getApp } from "../apps/api/dist/app.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (err) {
    console.error("API handler error:", err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Internal server error",
    });
  }
}
