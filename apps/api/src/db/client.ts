import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import initSqlJs, { type Database } from "sql.js";
import { resolveDataDir, resolveDbPath } from "./path.js";

const require = createRequire(import.meta.url);

let dbPromise: Promise<Database> | null = null;

function wasmLocateFile(file: string): string {
  const bundled = path.join(resolveDataDir(), file);
  if (fs.existsSync(bundled)) return bundled;

  try {
    const wasmDir = path.dirname(require.resolve("sql.js/dist/sql-wasm.wasm"));
    return path.join(wasmDir, file);
  } catch {
    throw new Error(`Cannot locate sql.js wasm file: ${file}`);
  }
}

export async function getDatabase(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const dbPath = resolveDbPath();
      if (!fs.existsSync(dbPath)) {
        throw new Error(`Portfolio database not found at ${dbPath}`);
      }

      const SQL = await initSqlJs({ locateFile: wasmLocateFile });
      const buffer = fs.readFileSync(dbPath);
      return new SQL.Database(buffer);
    })();
  }
  return dbPromise;
}

export async function saveDatabase(targetPath?: string): Promise<void> {
  const db = await getDatabase();
  const out = targetPath ?? resolveDbPath();
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(db.export()));
}
