import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TMP_DB = "/tmp/portfolio.db";

function defaultDbPath(): string {
  const fromRepoRoot = path.join(process.cwd(), "apps/api/data/portfolio.db");
  if (process.cwd().endsWith("/apps/api") || process.cwd().endsWith("\\apps\\api")) {
    return path.join(process.cwd(), "data/portfolio.db");
  }
  return fromRepoRoot;
}

/** Committed SQLite file — single source of truth for local + Vercel. */
export function resolveDbPath(): string {
  const bundled = defaultDbPath();
  fs.mkdirSync(path.dirname(bundled), { recursive: true });

  if (process.env.VERCEL && fs.existsSync(bundled)) {
    if (!fs.existsSync(TMP_DB)) {
      fs.copyFileSync(bundled, TMP_DB);
    }
    return TMP_DB;
  }

  const localFallback = path.join(__dirname, "../../data/portfolio.db");
  if (fs.existsSync(bundled)) return bundled;
  if (fs.existsSync(localFallback)) return localFallback;

  return bundled;
}
