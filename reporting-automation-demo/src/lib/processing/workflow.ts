import "server-only";

import path from "node:path";
import { readCsvFile } from "../csv";
import { rawDatasets } from "../datasets";
import { transformRawData } from "./transform";
import { reconcileDataset } from "./reconcile";
import type { RawInputs, RawRow, WorkflowResult, WorkflowView } from "./types";

const requiredColumns = {
  orders: ["Name", "Email", "Created at", "Financial Status", "Fulfillment Status", "Currency", "Subtotal", "Shipping", "Taxes", "Total", "Discount Code", "Discount Amount", "Lineitem quantity", "Lineitem name", "Lineitem price", "Lineitem sku", "Refunded Amount", "Location", "Source", "Customer ID"],
  products: ["Handle", "Title", "Vendor", "Product Category", "Variant Title", "Variant SKU", "Variant Price", "Cost per Item", "Inventory Quantity", "Status"],
  customers: ["Customer ID", "First Name", "Last Name", "Email", "City", "Province", "Country", "Created At", "Marketing Accepts", "Total Spent", "Total Orders"],
  expenses: ["Date", "Transaction Type", "Number", "Vendor", "Account/Category", "Memo/Description", "Amount"],
};

export function validateCsvStructure(
  csv: { headers: string[]; rows: string[][] },
  required: string[],
  filename: string,
): RawRow[] {
  if (new Set(csv.headers).size !== csv.headers.length || required.some((column) => !csv.headers.includes(column))) {
    throw new Error(`The columns in ${filename} do not match the expected export structure.`);
  }
  if (csv.rows.length === 0) throw new Error(`No records found in ${filename}.`);
  return csv.rows.map((row) => {
    if (row.length !== csv.headers.length) throw new Error(`A record in ${filename} has an unexpected column count.`);
    return Object.fromEntries(csv.headers.map((header, index) => [header, row[index]]));
  });
}

export async function loadRawInputs(): Promise<RawInputs> {
  const entries = await Promise.all(rawDatasets.map(async (dataset) => {
    const csv = await readCsvFile(path.join(process.cwd(), "data", "raw", dataset.filename));
    return [dataset.id, validateCsvStructure(csv, requiredColumns[dataset.id], dataset.filename)] as const;
  }));
  const source = Object.fromEntries(entries);
  return { orders: source.orders, products: source.products, customers: source.customers, expenses: source.expenses };
}

/** Stateless server entry point shared by processing, exports, and future dashboard work. */
export async function runReportingWorkflow(): Promise<WorkflowResult> {
  // Transform exclusively from raw inputs; clean files are loaded only afterward for comparison.
  const transformed = transformRawData(await loadRawInputs());
  const checks = await Promise.all(transformed.datasets.map(async (dataset) => {
    const reference = await readCsvFile(path.join(process.cwd(), "data", "clean", dataset.filename));
    return reconcileDataset(dataset, reference);
  }));
  return { ...transformed, reconciliation: { passed: checks.every((check) => check.passed), checks } };
}

export function workflowView(result: WorkflowResult): WorkflowView {
  return {
    summary: result.summary, reconciliation: result.reconciliation,
    exceptions: result.datasets.find((dataset) => dataset.id === "data_quality_exceptions")!.rows,
    datasets: result.datasets.map(({ id, name, filename, rows }) => ({ id, name, filename, rowCount: rows.length })),
  };
}
