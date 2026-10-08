import test from "node:test";
import assert from "node:assert/strict";
import { transformRawData, normalizeSku } from "./transform";
import { reconcileDataset, serializeDataset } from "./reconcile";
import type { RawInputs } from "./types";

function fixture(): RawInputs {
  const first = {
    Name: "#1", Email: "old@example.com", "Created at": "2025-01-15 12:00:00", "Financial Status": "paid",
    "Fulfillment Status": "fulfilled", Currency: "CAD", Subtotal: "100", Shipping: "10", Taxes: "15", Total: "125",
    "Discount Code": "", "Discount Amount": "0", "Lineitem quantity": "1", "Lineitem name": "Shirt",
    "Lineitem price": "60", "Lineitem sku": "NW-1001", "Refunded Amount": "0", Location: "Store", Source: "online_store", "Customer ID": "C1",
  };
  return {
    orders: [first, { ...first, Subtotal: "", Shipping: "", Taxes: "", Total: "", "Discount Amount": "", "Lineitem price": "40", "Lineitem sku": "NW-1002", "Lineitem name": "Hat" }],
    products: [{ "Variant SKU": "NW-1001", Title: "Shirt", "Product Category": "Tops", "Variant Title": "S", "Variant Price": "60", "Cost per Item": "20", "Inventory Quantity": "5", Status: "active" },
      { "Variant SKU": "NW-1002", Title: "Hat", "Product Category": "Accessories", "Variant Title": "OS", "Variant Price": "40", "Cost per Item": "10", "Inventory Quantity": "7", Status: "active" }],
    customers: [{ "Customer ID": "C1", "First Name": "Demo", "Last Name": "Shopper", Email: "changed@example.com", City: "Toronto", Province: "ON", Country: "Canada", "Created At": "2024-01-01", "Marketing Accepts": "no", "Total Spent": "999", "Total Orders": "20" }],
    expenses: [{ Date: "2025-01-12", "Transaction Type": "Expense", Number: "E1", Vendor: "Meta", "Account/Category": "Postage", "Memo/Description": "Sample, expense", Amount: "12.34" }],
  };
}

const rows = (result: ReturnType<typeof transformRawData>, id: string) => result.datasets.find((d) => d.id === id)!.rows;
const close = (actual: unknown, expected: number) => assert.ok(Math.abs(Number(actual) - expected) < 1e-9, `${String(actual)} != ${expected}`);

test("multi-line orders keep one total and retain every line, units, inventory, and stable customer ID", () => {
  const result = transformRawData(fixture());
  assert.equal(result.summary.orders, 1);
  assert.equal(result.summary.orderLines, 2);
  assert.equal(result.summary.netSales, 125);
  const order = rows(result, "orders_clean")[0];
  assert.equal(order.line_count, 2);
  assert.equal(order.units, 2);
  assert.equal(order.customer_id, "C1");
  assert.equal(order.order_month, "2025-01");
  assert.equal(rows(result, "products_clean")[0].inventory_value_at_cost, 100);
  assert.equal(rows(result, "customers_clean")[0].email, "changed@example.com");
});

test("voided orders remain auditable with zero net sales, COGS and gross profit", () => {
  const input = fixture();
  input.orders.forEach((r) => { r["Financial Status"] = "voided"; });
  const result = transformRawData(input);
  assert.equal(result.summary.netSales, 0);
  assert.equal(result.summary.voidedOrders, 1);
  for (const line of rows(result, "order_lines_clean")) {
    assert.equal(line.financial_status, "voided");
    assert.equal(line.net_line_sales, 0);
    assert.equal(line.cogs, 0);
    assert.equal(line.gross_profit, 0);
    assert.equal(line.gross_margin_pct, null);
  }
  assert.equal(rows(result, "data_quality_exceptions").length, 0);
});

test("full refunds use recorded line allocations, including reference negative merchandise sales", () => {
  const input = fixture();
  input.orders.forEach((r, i) => { r["Financial Status"] = "refunded"; r["Refunded Amount"] = i === 0 ? "80" : "45"; });
  const result = transformRawData(input);
  assert.equal(result.summary.netSales, 0);
  assert.equal(rows(result, "orders_clean")[0].refund_amount, 125);
  assert.deepEqual(rows(result, "order_lines_clean").map((r) => r.net_line_sales), [-20, -5]);
  assert.deepEqual(rows(result, "order_lines_clean").map((r) => r.cogs), [0, 0]);
  assert.equal(result.summary.refundedOrders, 1);
});

test("partial refunds reduce each line and reverse cost in proportion to its gross sales", () => {
  const input = fixture();
  input.orders.forEach((r, i) => { r["Financial Status"] = "partially_refunded"; r["Refunded Amount"] = i === 0 ? "15" : "5"; });
  const result = transformRawData(input);
  assert.equal(result.summary.netSales, 105);
  const lines = rows(result, "order_lines_clean");
  close(lines[0].net_line_sales, 45); close(lines[0].cogs, 15); close(lines[0].gross_profit, 30);
  close(lines[1].net_line_sales, 35); close(lines[1].cogs, 8.75);
  close(lines[0].gross_margin_pct, 30 / 45);
  close(result.financials.merchandiseNetSales, 80);
  close(result.financials.cogs, 23.75);
  close(result.financials.grossProfit, 56.25);
  close(result.financials.grossMargin, 56.25 / 80);
  assert.notEqual(result.financials.grossMargin, (Number(lines[0].gross_margin_pct) + Number(lines[1].gross_margin_pct)) / 2);
});

test("discounts allocate by gross line share, without reducing acquisition costs or double-discounting order totals", () => {
  const input = fixture();
  input.orders[0]["Discount Amount"] = "10";
  input.orders[0].Total = "115";
  const result = transformRawData(input);
  assert.equal(result.summary.netSales, 115);
  const lines = rows(result, "order_lines_clean");
  assert.deepEqual(lines.map((r) => r.allocated_discount), [6, 4]);
  assert.deepEqual(lines.map((r) => r.cogs), [20, 10]);
  assert.deepEqual(lines.map((r) => r.net_line_sales), [54, 36]);
});

test("discounted, partially refunded lines use gross sales as the cost-reversal denominator", () => {
  const input = fixture();
  input.orders[0]["Discount Amount"] = "10"; input.orders[0].Total = "115";
  input.orders[0]["Refunded Amount"] = "15";
  input.orders.forEach((r) => { r["Financial Status"] = "partially_refunded"; });
  const result = transformRawData(input);
  close(rows(result, "order_lines_clean")[0].cogs, 15);
  close(rows(result, "order_lines_clean")[0].net_line_sales, 39);
  close(result.summary.netSales, 100);
});

test("obvious SKU variants normalize, while missing and unmatched lines stay flagged with unknown product costs", () => {
  assert.equal(normalizeSku("NW1001"), "NW-1001");
  assert.equal(normalizeSku("OTHER1001"), "OTHER1001");
  const input = fixture(); input.orders[0]["Lineitem sku"] = "NW1001";
  const matched = transformRawData(input);
  assert.equal(matched.summary.normalizedSkus, 1);
  assert.equal(rows(matched, "order_lines_clean")[0].sku_match_status, "Matched");
  input.orders[0]["Lineitem sku"] = ""; input.orders[1]["Lineitem sku"] = "NW-9999";
  const result = transformRawData(input);
  assert.equal(result.summary.orderLines, 2);
  assert.equal(result.summary.missingSkus, 1);
  assert.equal(result.summary.unmatchedSkus, 1);
  assert.equal(rows(result, "data_quality_exceptions").length, 2);
  assert.equal(rows(result, "order_lines_clean")[0].unit_cost, null);
  assert.equal(rows(result, "order_lines_clean")[0].product_name, "");
});

test("expense aliases normalize without losing raw values, amount, date or description", () => {
  const input = fixture();
  input.expenses.push({ ...input.expenses[0], Number: "E2", Vendor: "Facebook Ads", "Account/Category": "Freight & Delivery" });
  const result = transformRawData(input);
  const expenses = rows(result, "expenses_clean");
  assert.equal(result.summary.vendorAliases, 2); assert.equal(result.summary.categoryAliases, 2);
  assert.equal(expenses[0].vendor_raw, "Meta"); assert.equal(expenses[0].vendor, "Meta Ads");
  assert.equal(expenses[0].category_raw, "Postage"); assert.equal(expenses[0].category, "Shipping & Delivery");
  assert.equal(expenses[0].amount, 12.34); assert.equal(expenses[0].date, "2025-01-12 00:00:00");
});

test("guests and unknown stable IDs are retained without email identity inference", () => {
  const input = fixture(); input.orders.forEach((r) => { r["Customer ID"] = ""; r.Email = "changed@example.com"; r.Source = "pos"; });
  let result = transformRawData(input);
  assert.equal(result.summary.guestOrders, 1);
  assert.equal(rows(result, "orders_clean")[0].customer_type, "Guest / Unidentified");
  assert.equal(rows(result, "orders_clean")[0].customer_id, "");
  assert.equal(rows(result, "orders_clean")[0].sales_channel, "POS");
  input.orders.forEach((r) => { r["Customer ID"] = "not-in-export"; });
  result = transformRawData(input);
  assert.equal(rows(result, "orders_clean")[0].customer_id, "not-in-export");
});

test("invalid numbers, duplicate product keys, impossible dates and conflicting order totals fail explicitly", () => {
  let input = fixture(); input.orders[0]["Lineitem quantity"] = "not a number";
  assert.throws(() => transformRawData(input), /Invalid numeric/);
  input = fixture(); input.products.push(input.products[0]);
  assert.throws(() => transformRawData(input), /duplicate sku_clean/);
  input = fixture(); input.orders[1].Total = "777";
  assert.throws(() => transformRawData(input), /Conflicting/);
  input = fixture(); input.orders.forEach((r) => { r["Created at"] = "2025-02-30 12:00:00"; });
  assert.throws(() => transformRawData(input), /Invalid source date/);
});

test("reconciliation detects incorrect financial results and schema/count mismatches", () => {
  const dataset = { id: "test", name: "Test", filename: "test.csv", headers: ["net_sales"], rows: [{ net_sales: 12.34 }] };
  assert.ok(reconcileDataset(dataset, { headers: ["net_sales"], rows: [["12.34000000001"]] }).passed);
  assert.equal(reconcileDataset(dataset, { headers: ["net_sales"], rows: [["12.35"]] }).passed, false);
  assert.equal(reconcileDataset(dataset, { headers: ["wrong"], rows: [] }).passed, false);
});

test("generated CSV exports quote commas, quotes, embedded newlines and blank cells", () => {
  const csv = serializeDataset({ id: "test", name: "Test", filename: "test.csv", headers: ["name", "cost"], rows: [{ name: 'Demo, "shop"\nline', cost: null }] });
  assert.equal(csv, 'name,cost\r\n"Demo, ""shop""\nline",\r\n');
});

test("reconciliation catches cumulative currency differences even when each cell is within tolerance", () => {
  const dataset = { id: "test", name: "Test", filename: "test.csv", headers: ["net_sales"], rows: Array.from({ length: 20 }, () => ({ net_sales: 12.341 })) };
  const check = reconcileDataset(dataset, { headers: ["net_sales"], rows: Array.from({ length: 20 }, () => ["12.34"]) });
  assert.equal(check.passed, false);
  assert.match(check.examples[0], /Aggregate net_sales/);
});
