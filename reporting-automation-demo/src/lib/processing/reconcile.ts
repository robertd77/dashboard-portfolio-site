import type { ReportingDataset, ReconciliationCheck } from "./types";

export function reconcileDataset(dataset: ReportingDataset, reference: { headers: string[]; rows: string[][] }): ReconciliationCheck {
  let mismatchedCells = 0;
  const examples: string[] = [];
  const note = (message: string) => {
    mismatchedCells += 1;
    if (examples.length < 3) examples.push(message);
  };
  if (JSON.stringify(dataset.headers) !== JSON.stringify(reference.headers)) note("Column names or order differ.");
  if (dataset.rows.length !== reference.rows.length) note("Record counts differ.");
  dataset.rows.forEach((row, index) => {
    const expected = reference.rows[index];
    if (!expected) return;
    dataset.headers.forEach((header, column) => {
      const value = row[header];
      const target = expected[column];
      let matches: boolean;
      if (typeof value === "number") {
        const tolerance = header === "gross_margin_pct" ? 1e-10 : 0.005;
        matches = target !== "" && target !== undefined && Number.isFinite(Number(target)) && Math.abs(value - Number(target)) <= tolerance;
      } else {
        matches = (value ?? "") === target;
      }
      if (!matches) note(`Row ${index + 1}, ${header}: generated ${String(value ?? "(blank)")}; reference ${String(target ?? "(missing)")}.`);
    });
  });
  // A small per-cell tolerance must not hide cumulative financial differences.
  for (const header of dataset.headers) {
    if (header === "gross_margin_pct" || !dataset.rows.some((row) => typeof row[header] === "number")) continue;
    const column = reference.headers.indexOf(header);
    if (column < 0) continue;
    const generatedTotal = dataset.rows.reduce((sum, row) => sum + (typeof row[header] === "number" ? row[header] : 0), 0);
    const referenceTotal = reference.rows.reduce((sum, row) => sum + Number(row[column] || 0), 0);
    if (!Number.isFinite(referenceTotal) || Math.abs(generatedTotal - referenceTotal) > 0.005) note(`Aggregate ${header} differs from the reference.`);
  }
  return {
    filename: dataset.filename, generatedRows: dataset.rows.length, referenceRows: reference.rows.length,
    passed: mismatchedCells === 0, mismatchedCells, examples,
  };
}

export function serializeDataset(dataset: ReportingDataset) {
  const escape = (value: string | number | null | undefined) => {
    const text = String(value ?? "");
    return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  return [dataset.headers, ...dataset.rows.map((row) => dataset.headers.map((header) => row[header]))]
    .map((row) => row.map(escape).join(",")).join("\r\n") + "\r\n";
}
