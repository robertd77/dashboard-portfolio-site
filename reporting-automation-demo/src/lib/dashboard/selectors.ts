import type { DashboardData, DashboardFilters, DashboardKpis } from "./types";

export const DEFAULT_DASHBOARD_FILTERS: DashboardFilters = {
  startMonth: "2025-01", endMonth: "2025-12", channel: "All",
};

export const DASHBOARD_MONTHS = Array.from({ length: 12 }, (_, index) => `2025-${String(index + 1).padStart(2, "0")}`);

const validMonth = (month: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(month);

/** Keep the inclusive date range valid when either month control changes. */
export function updateMonthRange(filters: DashboardFilters, boundary: "startMonth" | "endMonth", month: string): DashboardFilters {
  if (!validMonth(month)) throw new Error("Invalid reporting month.");
  const next = { ...filters, [boundary]: month };
  if (next.startMonth > next.endMonth) {
    if (boundary === "startMonth") next.endMonth = month;
    else next.startMonth = month;
  }
  return next;
}

/** Apply one shared month/channel selection to both reporting grains. */
export function filterDashboardData(data: DashboardData, filters: DashboardFilters): DashboardData {
  if (!validMonth(filters.startMonth) || !validMonth(filters.endMonth) || filters.startMonth > filters.endMonth) {
    throw new Error("Invalid reporting month range.");
  }
  const matches = (row: { month: string; channel: string }) =>
    row.month >= filters.startMonth && row.month <= filters.endMonth && (filters.channel === "All" || row.channel === filters.channel);
  const orders = [...new Map(data.orders.filter(matches).map((order) => [order.orderId, order])).values()];
  const orderIds = new Set(orders.map((order) => order.orderId));
  return {
    orders,
    orderLines: data.orderLines.filter((line) => orderIds.has(line.orderId) && matches(line)),
  };
}

/** Calculate order KPIs from orders and merchandise KPIs from lines; never join totals onto lines. */
export function calculateDashboardKpis(data: DashboardData): DashboardKpis {
  const orders = [...new Map(data.orders.map((order) => [order.orderId, order])).values()];
  const netSales = orders.reduce((sum, order) => sum + order.netSales, 0);
  const merchandiseNetSales = data.orderLines.reduce((sum, line) => sum + line.merchandiseNetSales, 0);
  const grossProfit = data.orderLines.reduce((sum, line) => sum + line.grossProfit, 0);
  return {
    netSales, orders: orders.length,
    averageOrderValue: orders.length > 0 ? netSales / orders.length : null,
    grossProfit, merchandiseNetSales,
    grossMargin: merchandiseNetSales !== 0 ? grossProfit / merchandiseNetSales : null,
    unverifiedCostLines: data.orderLines.filter((line) => line.unitCost === null).length,
  };
}
