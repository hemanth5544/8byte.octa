import type { HoldingAttributes } from "../models/Holding.js";
import { getDatabase } from "../db/client.js";

export async function findAllHoldings(): Promise<HoldingAttributes[]> {
  const db = await getDatabase();
  const result = db.exec(
    "SELECT id, name, sector, purchasePrice, quantity, exchangeCode, sortOrder FROM holdings ORDER BY sortOrder ASC",
  );

  if (!result.length || !result[0]) {
    return [];
  }

  const { columns, values } = result[0];
  return values.map((row: (string | number | null | Uint8Array)[]) => {
    const record: Record<string, unknown> = {};
    columns.forEach((col: string, i: number) => {
      record[col] = row[i];
    });
    return record as unknown as HoldingAttributes;
  });
}
