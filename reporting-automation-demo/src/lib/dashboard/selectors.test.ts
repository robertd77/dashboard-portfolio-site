import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse } from "csv-parse/sync";
import { runReportingWorkflow } from "../processing/workflow";
import { dashboardDataFromWorkflow } from "./data";
import { calculateDashboardKpis, filterDashboardData, updateMonthRange, DEFAULT_DASHBOARD_FILTERS, DASHBOARD_MONTHS } from "./selectors";
import { formatCurrency, formatMonth, formatPercentage } from "./format";
import type { DashboardData, DashboardFilters } from "./types";
import { selectMonthlySales, selectMonthlySalesInsight } from "./monthly-sales";

const close = (actual: number | null, expected: number, tolerance = 1e-9) => {
  assert.ok(actual !== null && Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);
};

function fixture(): DashboardData {
  return {
    orders: [
      { orderId: "A", month: "2025-01", channel: "Online", netSales: 125 },
      { orderId: "B", month: "2025-02", channel: "POS", netSales: 12 },
      { orderId: "C", month: "2025-03", channel: "Online", netSales: 0 },
    ],
    orderLines: [
      { orderId: "A", month: "2025-01", channel: "Online", merchandiseNetSales: 60, grossProfit: 42, unitCost: 18 },
      { orderId: "A", month: "2025-01", channel: "Online", merchandiseNetSales: 40, grossProfit: 28, unitCost: 12 },
      { orderId: "B", month: "2025-02", channel: "POS", merchandiseNetSales: 10, grossProfit: 1, unitCost: null },
      { orderId: "C", month: "2025-03", channel: "Online", merchandiseNetSales: 0, grossProfit: 0, unitCost: 20 },
    ],
  };
}

test("order KPIs count distinct orders including zero-sales orders without duplicating multi-line totals", () => {
  const data = fixture();
  data.orders.push({ ...data.orders[0] });
  const kpis = calculateDashboardKpis(data);
  assert.equal(kpis.orders, 3);
  assert.equal(kpis.netSales, 137);
  close(kpis.averageOrderValue, 137 / 3);
  assert.equal(kpis.grossProfit, 71);
  assert.equal(kpis.merchandiseNetSales, 110);
  close(kpis.grossMargin, 71 / 110);
  assert.notEqual(kpis.grossMargin, (0.7 + 0.1) / 2);
});

test("inclusive month/channel filters apply to both grains and exclude unrelated lines", () => {
  const data = fixture();
  data.orderLines.push({ ...data.orderLines[0], orderId: "orphan" }, { ...data.orderLines[0], month: "2025-12" });
  const filtered = filterDashboardData(data, { startMonth: "2025-01", endMonth: "2025-02", channel: "Online" });
  assert.deepEqual(filtered.orders.map((row) => row.orderId), ["A"]);
  assert.equal(filtered.orderLines.length, 2);
  const kpis = calculateDashboardKpis(filtered);
  assert.equal(kpis.netSales, 125);
  assert.equal(kpis.orders, 1);
  assert.equal(kpis.averageOrderValue, 125);
  assert.equal(kpis.grossProfit, 70);
  assert.equal(kpis.grossMargin, 0.7);
  assert.equal(kpis.unverifiedCostLines, 0);
  const pos = calculateDashboardKpis(filterDashboardData(data, { startMonth: "2025-02", endMonth: "2025-02", channel: "POS" }));
  assert.equal(pos.unverifiedCostLines, 1);
  assert.equal(pos.netSales, 12);
  assert.equal(pos.grossMargin, 0.1);
});

test("empty selections and zero merchandise totals return unavailable ratios without NaN or Infinity", () => {
  const empty = calculateDashboardKpis(filterDashboardData(fixture(), { startMonth: "2024-01", endMonth: "2024-12", channel: "All" }));
  assert.deepEqual(empty, { netSales: 0, orders: 0, averageOrderValue: null, grossProfit: 0, grossMargin: null, merchandiseNetSales: 0, unverifiedCostLines: 0 });
  const zero = calculateDashboardKpis(filterDashboardData(fixture(), { startMonth: "2025-03", endMonth: "2025-03", channel: "All" }));
  assert.equal(zero.averageOrderValue, 0);
  assert.equal(zero.grossMargin, null);
});

test("month controls preserve an inclusive valid range and reject malformed dates", () => {
  const filters = { ...DEFAULT_DASHBOARD_FILTERS, endMonth: "2025-03" };
  assert.deepEqual(updateMonthRange(filters, "startMonth", "2025-07"), { ...filters, startMonth: "2025-07", endMonth: "2025-07" });
  assert.deepEqual(updateMonthRange({ ...filters, startMonth: "2025-02" }, "endMonth", "2025-01"), { ...filters, startMonth: "2025-01", endMonth: "2025-01" });
  assert.throws(() => updateMonthRange(filters, "startMonth", "2025-13"), /Invalid/);
  assert.throws(() => filterDashboardData(fixture(), { ...filters, startMonth: "2025-12" }), /Invalid/);
  assert.throws(() => filterDashboardData(fixture(), { ...filters, startMonth: "bad" }), /Invalid/);
});

test("CAD, percentages, unavailable ratios and months have clear display formatting", () => {
  assert.equal(formatCurrency(230.498), "$230.50");
  assert.equal(formatCurrency(null), "—");
  assert.equal(formatPercentage(0.5911453316), "59.11%");
  assert.equal(formatPercentage(null), "—");
  assert.equal(formatMonth("2025-01"), "January 2025");
});

test("monthly sales retain all 12 months and deduplicate order totals while zero-order months have no AOV", () => {
  const data = fixture();
  data.orders.push({ ...data.orders[0] });
  const points = selectMonthlySales(data, DEFAULT_DASHBOARD_FILTERS);
  assert.equal(points.length, 12);
  assert.deepEqual(points[0], { month: "2025-01", inRange: true, netSales: 125, orders: 1, averageOrderValue: 125 });
  assert.equal(points[2].orders, 1);
  assert.equal(points[2].averageOrderValue, 0);
  assert.equal(points[3].netSales, 0);
  assert.equal(points[3].orders, 0);
  assert.equal(points[3].averageOrderValue, null);
  assert.equal(points.reduce((sum, point) => sum + (point.netSales ?? 0), 0), calculateDashboardKpis(data).netSales);
});

test("excluded months are gaps, not zero-sales observations, and single-month insights respect the selection", () => {
  const filters: DashboardFilters = { startMonth: "2025-02", endMonth: "2025-02", channel: "POS" };
  const points = selectMonthlySales(filterDashboardData(fixture(), filters), filters);
  assert.deepEqual(points[0], { month: "2025-01", inRange: false, netSales: null, orders: null, averageOrderValue: null });
  assert.equal(points[1].netSales, 12);
  const insight = selectMonthlySalesInsight(points)!;
  assert.equal(insight.peak.month, "2025-02");
  assert.equal(insight.q4MonthCount, 0);
  assert.equal(insight.selectedMonthCount, 1);
  assert.equal(insight.totalSales, 12);
});

test("holiday insights are calculated from selected sales, including partial Q4 and zero-total views", () => {
  const data = fixture();
  data.orders.push({ orderId: "D", month: "2025-11", channel: "POS", netSales: 200 }, { orderId: "E", month: "2025-12", channel: "Online", netSales: 300 });
  const insight = selectMonthlySalesInsight(selectMonthlySales(data, DEFAULT_DASHBOARD_FILTERS))!;
  assert.equal(insight.peak.month, "2025-12");
  assert.equal(insight.q4Sales, 500);
  close(insight.q4Share, 500 / 637);
  assert.equal(insight.q4MonthCount, 3);
  const filters: DashboardFilters = { startMonth: "2025-11", endMonth: "2025-11", channel: "POS" };
  const partial = selectMonthlySalesInsight(selectMonthlySales(filterDashboardData(data, filters), filters))!;
  assert.equal(partial.q4MonthCount, 1);
  assert.equal(partial.q4Sales, 200);
  assert.equal(partial.q4Share, 1);
  const zeroFilters = { ...filters, startMonth: "2025-03", endMonth: "2025-03", channel: "Online" as const };
  const zero = selectMonthlySalesInsight(selectMonthlySales(filterDashboardData(data, zeroFilters), zeroFilters))!;
  assert.equal(zero.q4Share, null);
});

test("empty reporting views retain the calendar without inventing insights", () => {
  const points = selectMonthlySales({ orders: [], orderLines: [] }, DEFAULT_DASHBOARD_FILTERS);
  assert.ok(points.every((point) => point.netSales === 0 && point.orders === 0 && point.averageOrderValue === null));
  assert.equal(selectMonthlySalesInsight(points), null);
});

test("processed dashboard metrics reconcile independently with references for the year and every month/channel", async () => {
  const result = await runReportingWorkflow();
  const data = dashboardDataFromWorkflow(result);
  const yearly = calculateDashboardKpis(filterDashboardData(data, DEFAULT_DASHBOARD_FILTERS));
  assert.equal(yearly.orders, 6300);
  close(yearly.netSales, 1452137.84, 0.005);
  close(yearly.averageOrderValue, 1452137.84 / 6300);
  close(yearly.grossProfit, 743088.6576370334, 0.005);
  close(yearly.grossMargin, 743088.6576370334 / 1257032.1);
  assert.equal(yearly.unverifiedCostLines, 6);
  const reference = async (name: string): Promise<Record<string, string>[]> => parse(await readFile(`data/clean/${name}.csv`, "utf8"), { columns: true });
  const [orders, lines] = await Promise.all([reference("orders_clean"), reference("order_lines_clean")]);
  const ranges = [...DASHBOARD_MONTHS.map((month) => [month, month]), ["2025-10", "2025-12"], ["2025-01", "2025-12"]];
  for (const [startMonth, endMonth] of ranges) {
    for (const channel of ["All", "Online", "POS"] as const) {
      const filters: DashboardFilters = { startMonth, endMonth, channel };
      const matches = (row: Record<string, string>) => row.order_month >= startMonth && row.order_month <= endMonth && (channel === "All" || row.sales_channel === channel);
      const expectedOrders = orders.filter(matches);
      const expectedLines = lines.filter(matches);
      const count = new Set(expectedOrders.map((row) => row.order_id)).size;
      const net = expectedOrders.reduce((sum, row) => sum + Number(row.net_sales), 0);
      const merchandise = expectedLines.reduce((sum, row) => sum + Number(row.net_line_sales), 0);
      const profit = expectedLines.reduce((sum, row) => sum + Number(row.gross_profit), 0);
      const actual = calculateDashboardKpis(filterDashboardData(data, filters));
      const monthly = selectMonthlySales(filterDashboardData(data, filters), filters);
      close(monthly.reduce((sum, point) => sum + (point.netSales ?? 0), 0), actual.netSales, 0.005);
      assert.equal(monthly.reduce((sum, point) => sum + (point.orders ?? 0), 0), actual.orders);
      for (const point of monthly) {
        if (!point.inRange) {
          assert.equal(point.netSales, null);
          continue;
        }
        const monthOrders = expectedOrders.filter((row) => row.order_month === point.month);
        const monthNet = monthOrders.reduce((sum, row) => sum + Number(row.net_sales), 0);
        close(point.netSales, monthNet, 0.005);
        assert.equal(point.orders, monthOrders.length);
        if (monthOrders.length) close(point.averageOrderValue, monthNet / monthOrders.length);
        else assert.equal(point.averageOrderValue, null);
      }
      assert.equal(actual.orders, count);
      close(actual.netSales, net, 0.005);
      close(actual.averageOrderValue, net / count);
      close(actual.grossProfit, profit, 0.005);
      close(actual.merchandiseNetSales, merchandise, 0.005);
      close(actual.grossMargin, profit / merchandise);
      assert.equal(actual.unverifiedCostLines, expectedLines.filter((row) => row.unit_cost === "").length);
    }
  }
  assert.throws(() => dashboardDataFromWorkflow({ ...result, reconciliation: { ...result.reconciliation, passed: false } }), /reconciliation/);
  assert.throws(() => dashboardDataFromWorkflow({ ...result, datasets: [] }), /missing/);
});
