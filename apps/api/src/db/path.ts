import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function dataDirCandidates(): string[] {
  return [
    path.join(process.cwd(), "apps/api/data"),
    path.join(process.cwd(), "data"),
    path.join(__dirname, "../../data"),
  ];
}

/** Directory containing portfolio.db and sql-wasm.wasm (bundled on Vercel). */
export function resolveDataDir(): string {
  for (const dir of dataDirCandidates()) {
    if (fs.existsSync(path.join(dir, "portfolio.db"))) {
      return dir;
    }
  }

  const fallback = path.join(process.cwd(), "apps/api/data");
  fs.mkdirSync(fallback, { recursive: true });
  return fallback;
}

export function resolveDbPath(): string {
  return path.join(resolveDataDir(), "portfolio.db");
}
