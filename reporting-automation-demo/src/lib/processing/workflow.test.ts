import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { runReportingWorkflow, validateCsvStructure } from "./workflow";
import { serializeDataset } from "./reconcile";

test("CSV structure validation rejects missing/duplicate columns and empty exports", () => {
  assert.throws(() => validateCsvStructure({ headers: ["wrong"], rows: [["1"]] }, ["Name"], "orders.csv"), /columns/);
  assert.throws(() => validateCsvStructure({ headers: ["Name", "Name"], rows: [["1", "2"]] }, ["Name"], "orders.csv"), /columns/);
  assert.throws(() => validateCsvStructure({ headers: ["Name"], rows: [] }, ["Name"], "orders.csv"), /No records/);
});

test("actual raw processing reconciles every field across all six references, is repeatable, and never changes source files", async () => {
  const filenames = [
    "raw/orders.csv", "raw/products_inventory.csv", "raw/customers.csv", "raw/expenses.csv",
    "clean/orders_clean.csv", "clean/order_lines_clean.csv", "clean/products_clean.csv", "clean/customers_clean.csv", "clean/expenses_clean.csv", "clean/data_quality_exceptions.csv",
  ];
  const hashes = () => Promise.all(filenames.map(async (filename) => createHash("sha256").update(await readFile(path.join(process.cwd(), "data", filename))).digest("hex")));
  const before = await hashes();
  const result = await runReportingWorkflow();
  assert.ok(result.reconciliation.passed, JSON.stringify(result.reconciliation.checks));
  assert.equal(result.reconciliation.checks.length, 6);
  for (const check of result.reconciliation.checks) assert.equal(check.mismatchedCells, 0);
  assert.equal(result.summary.orders, 6300); assert.equal(result.summary.orderLines, 10203);
  assert.ok(Math.abs(result.summary.netSales - 1452137.84) < 0.005);
  assert.equal(result.summary.missingSkus, 6); assert.equal(result.summary.unmatchedSkus, 0);
  assert.equal(result.summary.normalizedSkus, 18);
  assert.equal(result.summary.vendorAliases, 7); assert.equal(result.summary.categoryAliases, 6);
  assert.equal(result.summary.voidedOrders, 121); assert.equal(result.summary.refundedOrders, 331);
  assert.equal(result.summary.guestOrders, 149);
  assert.ok(Math.abs(result.financials.merchandiseNetSales - 1257032.1) < 0.005);
  assert.ok(Math.abs(result.financials.cogs - 513943.44236296654) < 0.005);
  assert.ok(Math.abs(result.financials.grossProfit - 743088.6576370334) < 0.005);
  assert.ok(Math.abs(result.financials.grossMargin! - result.financials.grossProfit / result.financials.merchandiseNetSales) < 1e-10);
  assert.equal(result.financials.unverifiedCostLines, 6);
  assert.deepEqual(await runReportingWorkflow(), result);
  assert.deepEqual(await hashes(), before);
  for (const dataset of result.datasets) {
    const parsed: string[][] = parse(serializeDataset(dataset));
    assert.deepEqual(parsed[0], dataset.headers);
    assert.equal(parsed.length - 1, dataset.rows.length);
  }
});
