import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse } from "csv-parse/sync";
import { runReportingWorkflow } from "../processing/workflow";
import { dashboardDataFromWorkflow } from "./data";
import { calculateDashboardKpis, DEFAULT_DASHBOARD_FILTERS, DASHBOARD_MONTHS, filterDashboardData } from "./selectors";
import { classifyCustomerPurchases, selectCategoryPerformance, selectCustomerPurchaseMix, selectProductPerformance } from "./chart-selectors";
import type { DashboardData, DashboardOrder, DashboardOrderLine } from "./types";

const close = (actual: number | null, expected: number, tolerance = 1e-9) => assert.ok(actual !== null && Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);
const order = (id: string, month: string, customer = "C1", channel: "Online" | "POS" = "Online", net = 100): DashboardOrder => ({ orderId: id, month, orderDate: `${month}-15 12:00:00`, customerId: customer, channel, netSales: net });
const line = (o: DashboardOrder, sku: string, category = "Tops", revenue = 100, profit = 50, quantity = 1, status = "paid"): DashboardOrderLine => ({ orderId: o.orderId, month: o.month, channel: o.channel, merchandiseNetSales: revenue, grossProfit: profit, unitCost: sku ? 10 : null, sku, productName: sku ? "Widget" : "", category, quantity, financialStatus: status });
const empty = (): DashboardData => ({ orders: [], orderLines: [], products: [] });

test("category totals retain unmapped revenue and use weighted margins and a consistent all-merchandise denominator", () => {
  const o = order("A", "2025-01");
  const data = { ...empty(), orders: [o], orderLines: [line(o, "S1", "Tops", 100, 70), line(o, "S2", "Tops", 10, 1), line(o, "", "", 20, 20)] };
  const result = selectCategoryPerformance(data);
  assert.equal(result.categories.length, 5);
  const tops = result.categories.find((point) => point.category === "Tops")!;
  close(tops.grossMargin, 71 / 110);
  close(tops.revenueShare, 110 / 130);
  assert.equal(result.unmapped.revenue, 20);
  assert.equal(result.unmapped.unknownCostLines, 1);
  close(result.categories.reduce((sum, point) => sum + point.revenue, 0) + result.unmapped.revenue, result.totalRevenue);
  close(result.categories.reduce((sum, point) => sum + point.grossProfit, 0) + result.unmapped.grossProfit, result.totalProfit);
});

test("product inventory counts every SKU once across variants, while velocity reaches before the selected start month", () => {
  const orders = [order("S", "2025-09"), order("O", "2025-10"), order("N", "2025-11"), order("D", "2025-12"), order("V", "2025-12"), order("P", "2025-12", "C2", "POS")];
  const data: DashboardData = { orders, products: [{ sku: "S1", name: "Widget", category: "Tops", inventory: 2 }, { sku: "S2", name: "Widget", category: "Tops", inventory: 4 }],
    orderLines: [line(orders[0], "S1", "Tops", 1000, 500, 999), line(orders[1], "S1", "Tops", 200, 100, 2), line(orders[2], "S2", "Tops", 300, 150, 3), line(orders[3], "S1", "Tops", 400, 200, 5, "partially_refunded"), line(orders[4], "S2", "Tops", 0, 0, 999, "voided"), line(orders[5], "S1", "Tops", 900, 450, 50)] };
  const filters = { startMonth: "2025-12", endMonth: "2025-12", channel: "Online" as const };
  const result = selectProductPerformance(data, filterDashboardData(data, filters), filters);
  const widget = result.products[0];
  assert.equal(result.windowStart, "2025-10");
  assert.equal(result.windowMonths, 3);
  assert.equal(widget.inventory, 6);
  assert.equal(widget.revenue, 400);
  assert.equal(widget.units, 5);
  assert.equal(widget.recentUnits, 10);
  close(widget.coverage, 6 / (10 / 3));
  assert.equal(widget.lowStock, true);
  const all = selectProductPerformance(data, filterDashboardData(data, { ...filters, channel: "All" }), { ...filters, channel: "All" });
  assert.equal(all.products[0].inventory, 6);
  assert.equal(all.products[0].recentUnits, 60);
});

test("early-year velocity uses only available months, missing SKUs stay visible, and absent velocity has no invented coverage", () => {
  const o = order("A", "2025-01");
  const data: DashboardData = { orders: [o], products: [{ sku: "S1", name: "Widget", category: "Tops", inventory: 20 }], orderLines: [line(o, "S1", "Tops", 100, 50, 2), line(o, "", "", 25, 25)] };
  const filters = { ...DEFAULT_DASHBOARD_FILTERS, endMonth: "2025-01" };
  const early = selectProductPerformance(data, filterDashboardData(data, filters), filters);
  assert.equal(early.windowMonths, 1);
  assert.equal(early.products[0].coverage, 10);
  assert.equal(early.unmappedRevenue, 25);
  const later = selectProductPerformance(data, data, DEFAULT_DASHBOARD_FILTERS);
  assert.equal(later.products[0].coverage, null);
  assert.equal(later.products[0].lowStock, false);
});

test("customer classification sorts the full history, crosses channels, preserves guests and zero orders, and resolves timestamp ties deterministically", () => {
  const a = order("A", "2025-01", "C1", "POS", 0);
  const b = order("B", "2025-02", "C1", "Online", 200);
  const c = order("C", "2025-02", "", "Online", 25);
  const d = order("D", "2025-02", "C2", "POS", 100);
  const e = { ...d, orderId: "E" };
  const data = { ...empty(), orders: [e, b, c, d, a, { ...b }] };
  const types = classifyCustomerPurchases(data.orders);
  assert.equal(types.get("A"), "first"); assert.equal(types.get("B"), "repeat"); assert.equal(types.get("C"), "guest");
  assert.equal(types.get("D"), "first"); assert.equal(types.get("E"), "repeat");
  const filters = { startMonth: "2025-02", endMonth: "2025-02", channel: "Online" as const };
  const mix = selectCustomerPurchaseMix(filterDashboardData(data, filters), filters, types);
  assert.equal(mix.firstOrders, 0); assert.equal(mix.repeatOrders, 1); assert.equal(mix.guestOrders, 1);
  assert.equal(mix.repeatRevenue, 200); assert.equal(mix.guestRevenue, 25); assert.equal(mix.repeatShare, 1);
  assert.equal(mix.months[0].firstRevenue, null);
  assert.throws(() => selectCustomerPurchaseMix(data, DEFAULT_DASHBOARD_FILTERS, new Map()), /classification/);
});

test("empty chart selections have zero totals, empty rankings, and unavailable ratios", () => {
  const data = empty();
  const categories = selectCategoryPerformance(data);
  assert.ok(categories.categories.every((point) => point.revenue === 0 && point.grossMargin === null && point.revenueShare === null));
  assert.deepEqual(selectProductPerformance(data, data, DEFAULT_DASHBOARD_FILTERS).products, []);
  const mix = selectCustomerPurchaseMix(data, DEFAULT_DASHBOARD_FILTERS, new Map());
  assert.equal(mix.repeatShare, null); assert.equal(mix.guestOrders, 0); assert.equal(mix.repeatRevenue, 0);
});

test("all new chart metrics independently reconcile to reference exports for every month/channel, Q4, and the year", async () => {
  const data = dashboardDataFromWorkflow(await runReportingWorkflow());
  const read = async (name: string): Promise<Record<string, string>[]> => parse(await readFile(`data/clean/${name}.csv`, "utf8"), { columns: true });
  const [orders, lines, products] = await Promise.all([read("orders_clean"), read("order_lines_clean"), read("products_clean")]);
  const seen = new Set<string>();
  const referenceTypes = new Map<string, string>();
  for (const row of [...orders].sort((a, b) => a.order_date.localeCompare(b.order_date) || a.order_id.localeCompare(b.order_id))) {
    referenceTypes.set(row.order_id, !row.customer_id ? "guest" : seen.has(row.customer_id) ? "repeat" : "first");
    if (row.customer_id) seen.add(row.customer_id);
  }
  const types = classifyCustomerPurchases(data.orders);
  assert.deepEqual([...types].sort(), [...referenceTypes].sort());
  const master = new Map(products.map((row) => [row.sku_clean, row]));
  const ranges = [...DASHBOARD_MONTHS.map((month) => [month, month]), ["2025-10", "2025-12"], ["2025-01", "2025-12"]];
  for (const [startMonth, endMonth] of ranges) for (const channel of ["All", "Online", "POS"] as const) {
    const filters = { startMonth, endMonth, channel };
    const filtered = filterDashboardData(data, filters);
    const matches = (row: Record<string, string>) => row.order_month >= startMonth && row.order_month <= endMonth && (channel === "All" || row.sales_channel === channel);
    const selectedLines = lines.filter(matches), selectedOrders = orders.filter(matches);
    const expectedCategory = new Map<string, { revenue: number; profit: number }>();
    for (const row of selectedLines) {
      const key = row.category || "Unmapped";
      const value = expectedCategory.get(key) ?? { revenue: 0, profit: 0 };
      value.revenue += Number(row.net_line_sales); value.profit += Number(row.gross_profit); expectedCategory.set(key, value);
    }
    const categories = selectCategoryPerformance(filtered);
    for (const point of [...categories.categories, categories.unmapped]) {
      const expected = expectedCategory.get(point.category) ?? { revenue: 0, profit: 0 };
      close(point.revenue, expected.revenue, 0.005); close(point.grossProfit, expected.profit, 0.005);
    }
    const kpis = calculateDashboardKpis(filtered);
    close(categories.categories.reduce((sum, point) => sum + point.revenue, 0) + categories.unmapped.revenue, kpis.merchandiseNetSales, 0.005);
    close(categories.categories.reduce((sum, point) => sum + point.grossProfit, 0) + categories.unmapped.grossProfit, kpis.grossProfit, 0.005);
    const mix = selectCustomerPurchaseMix(filtered, filters, types);
    for (const kind of ["first", "repeat", "guest"] as const) {
      const expectedOrders = selectedOrders.filter((row) => referenceTypes.get(row.order_id) === kind);
      close(mix[`${kind}Revenue`], expectedOrders.reduce((sum, row) => sum + Number(row.net_sales), 0), 0.005);
      assert.equal(mix[`${kind}Orders`], expectedOrders.length);
    }
    close(mix.firstRevenue + mix.repeatRevenue + mix.guestRevenue, kpis.netSales, 0.005);
    assert.equal(mix.firstOrders + mix.repeatOrders + mix.guestOrders, kpis.orders);
    const actualProducts = selectProductPerformance(data, filtered, filters);
    const expectedNames = [...new Set(selectedLines.filter((row) => master.has(row.sku_clean)).map((row) => master.get(row.sku_clean)!.product_name))];
    const expectedProducts = expectedNames.map((name) => {
      const skus = new Set(products.filter((row) => row.product_name === name).map((row) => row.sku_clean));
      const sales = selectedLines.filter((row) => skus.has(row.sku_clean));
      const recent = lines.filter((row) => skus.has(row.sku_clean) && row.order_month >= `2025-${String(Math.max(1, Number(endMonth.slice(5)) - 2)).padStart(2, "0")}` && row.order_month <= endMonth && (channel === "All" || row.sales_channel === channel) && row.financial_status !== "voided");
      const inventory = products.filter((row) => skus.has(row.sku_clean)).reduce((sum, row) => sum + Number(row.inventory_quantity), 0);
      const recentUnits = recent.reduce((sum, row) => sum + Number(row.quantity), 0);
      const windowMonths = Math.min(3, Number(endMonth.slice(5)));
      return { name, revenue: sales.reduce((sum, row) => sum + Number(row.net_line_sales), 0), inventory,
        units: sales.filter((row) => row.financial_status !== "voided").reduce((sum, row) => sum + Number(row.quantity), 0),
        coverage: recentUnits ? inventory / (recentUnits / windowMonths) : null };
    }).sort((a, b) => b.revenue - a.revenue || a.name.localeCompare(b.name));
    assert.deepEqual(actualProducts.ranked.map((point) => point.name), expectedProducts.map((point) => point.name));
    assert.equal(actualProducts.products.length, Math.min(8, expectedProducts.length));
    for (const [index, actual] of actualProducts.ranked.entries()) {
      const expected = expectedProducts[index];
      close(actual.revenue, expected.revenue, 0.005); assert.equal(actual.inventory, expected.inventory); assert.equal(actual.units, expected.units);
      if (expected.coverage === null) assert.equal(actual.coverage, null); else close(actual.coverage, expected.coverage);
    }
    close(actualProducts.ranked.reduce((sum, point) => sum + point.revenue, 0) + actualProducts.unmappedRevenue, kpis.merchandiseNetSales, 0.005);
  }
  const annual = selectProductPerformance(data, data, DEFAULT_DASHBOARD_FILTERS);
  assert.equal(annual.products[0].name, "Insulated Jacket"); close(annual.products[0].revenue, 167345.74, 0.005);
  close(annual.products[0].coverage, 122 / (321 / 3));
  const annualCategories = selectCategoryPerformance(data);
  assert.equal(annualCategories.categories[0].category, "Outerwear");
  assert.equal(annualCategories.unmapped.lineCount, 6);
  close(annualCategories.unmapped.revenue, 680.96, 0.005);
});
