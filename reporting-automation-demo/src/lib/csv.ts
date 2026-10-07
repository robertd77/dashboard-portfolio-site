import "server-only";

import { readFile } from "node:fs/promises";
import { parse } from "csv-parse/sync";

/** Parse CSV syntax only: preserve header order, empty cells, and string values. */
export async function readCsvFile(filePath: string) {
  const content = await readFile(filePath, "utf8");
  const records: string[][] = parse(content, { bom: true });
  const [headers = [], ...rows] = records;

  return { headers, rows };
}
