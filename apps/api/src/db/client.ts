import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import initSqlJs, { type Database } from "sql.js";
import { resolveDbPath } from "./path.js";

const require = createRequire(import.meta.url);

let dbPromise: Promise<Database> | null = null;

function wasmLocateFile(file: string): string {
  const wasmDir = path.dirname(require.resolve("sql.js/dist/sql-wasm.wasm"));
  return path.join(wasmDir, file);
}

export async function getDatabase(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const SQL = await initSqlJs({ locateFile: wasmLocateFile });
      const dbPath = resolveDbPath();
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
