import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse } from "csv-parse/sync";
import { runReportingWorkflow } from "../processing/workflow";
import { dashboardDataFromWorkflow } from "../dashboard/data";
import { selectCaseStudyInsights } from "./insights";

const close = (actual: number | null, expected: number) => assert.ok(actual !== null && Math.abs(actual - expected) < 1e-7, `${actual} != ${expected}`);

test("case-study figures reconcile to independent reference order, merchandise and stock calculations", async () => {
  const insights = selectCaseStudyInsights(dashboardDataFromWorkflow(await runReportingWorkflow()));
  const read = async (filename: string): Promise<Record<string, string>[]> => parse(await readFile(`data/clean/${filename}.csv`), { columns: true });
  const [orders, lines, products] = await Promise.all([read("orders_clean"), read("order_lines_clean"), read("products_clean")]);
  const sum = (rows: Record<string, string>[], field: string) => rows.reduce((total, row) => total + Number(row[field]), 0);
  const quarterly = Array.from({ length: 4 }, (_, index) => sum(orders.filter((order) => Math.floor((Number(order.order_month.slice(5)) - 1) / 3) === index), "net_sales"));
  close(insights.kpis.netSales, sum(orders, "net_sales"));
  assert.equal(insights.kpis.orders, new Set(orders.map((order) => order.order_id)).size);
  assert.equal(insights.lineCount, lines.length);
  insights.quarters.forEach((quarter, index) => close(quarter.netSales, quarterly[index]));
  close(insights.q4Growth, (quarterly[3] - quarterly[2]) / quarterly[2]);
  close(insights.q4Share, quarterly[3] / sum(orders, "net_sales"));
  const outerwear = lines.filter((line) => line.category === "Outerwear");
  close(insights.outerwear.revenue, sum(outerwear, "net_line_sales"));
  close(insights.outerwear.revenueShare, sum(outerwear, "net_line_sales") / sum(lines, "net_line_sales"));
  close(insights.outerwear.grossMargin, sum(outerwear, "gross_profit") / sum(outerwear, "net_line_sales"));
  assert.equal(insights.categories.unmapped.lineCount, lines.filter((line) => !line.category).length);
  const ranked = [...new Set(products.map((product) => product.product_name))].map((name) => {
    const variants = products.filter((product) => product.product_name === name);
    const skus = new Set(variants.map((product) => product.sku_clean));
    const sold = lines.filter((line) => skus.has(line.sku_clean));
    const recent = sold.filter((line) => line.order_month >= "2025-10" && line.financial_status !== "voided");
    const inventory = sum(variants, "inventory_quantity");
    const velocity = sum(recent, "quantity") / 3;
    return { name, revenue: sum(sold, "net_line_sales"), inventory, coverage: velocity > 0 ? inventory / velocity : null };
  }).sort((a, b) => b.revenue - a.revenue || a.name.localeCompare(b.name));
  insights.inventory.products.slice(0, 3).forEach((product, index) => {
    assert.equal(product.name, ranked[index].name);
    close(product.revenue, ranked[index].revenue);
    assert.equal(product.inventory, ranked[index].inventory);
    close(product.coverage, ranked[index].coverage!);
  });
});

test("case-study comparisons remain unavailable when there is no sales history", () => {
  const result = selectCaseStudyInsights({ orders: [], orderLines: [], products: [] });
  assert.equal(result.q4Growth, null);
  assert.equal(result.q4Share, null);
  assert.equal(result.outerwear.revenueShare, null);
  assert.equal(result.outerwear.grossMargin, null);
  assert.deepEqual(result.inventory.products, []);
});
