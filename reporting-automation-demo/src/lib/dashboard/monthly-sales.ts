import { calculateDashboardKpis, DASHBOARD_MONTHS } from "./selectors";
import type { DashboardData, DashboardFilters, DashboardOrder } from "./types";

export type MonthlySalesPoint = {
  month: string;
  inRange: boolean;
  netSales: number | null;
  orders: number | null;
  averageOrderValue: number | null;
};

/** Keep the year visible, but never represent excluded months as zero sales. */
export function selectMonthlySales(filteredData: DashboardData, filters: DashboardFilters): MonthlySalesPoint[] {
  const byMonth = new Map<string, DashboardOrder[]>();
  for (const order of filteredData.orders) {
    const bucket = byMonth.get(order.month) ?? [];
    bucket.push(order);
    byMonth.set(order.month, bucket);
  }
  return DASHBOARD_MONTHS.map((month) => {
    const inRange = month >= filters.startMonth && month <= filters.endMonth;
    const metrics = calculateDashboardKpis({ orders: byMonth.get(month) ?? [], orderLines: [] });
    return {
      month, inRange,
      netSales: inRange ? metrics.netSales : null,
      orders: inRange ? metrics.orders : null,
      averageOrderValue: inRange ? metrics.averageOrderValue : null,
    };
  });
}

/** Describe only the selected data; partial ranges never imply an annual comparison. */
export function selectMonthlySalesInsight(points: MonthlySalesPoint[]) {
  const selected = points.filter((point) => point.inRange);
  const withOrders = selected.filter((point) => (point.orders ?? 0) > 0);
  if (withOrders.length === 0) return null;
  const peak = withOrders.reduce((best, point) => (point.netSales ?? 0) > (best.netSales ?? 0) ? point : best);
  const totalSales = selected.reduce((sum, point) => sum + (point.netSales ?? 0), 0);
  const q4 = selected.filter((point) => point.month >= "2025-10");
  const q4Sales = q4.reduce((sum, point) => sum + (point.netSales ?? 0), 0);
  return {
    peak, totalSales, q4Sales,
    q4Share: totalSales > 0 ? q4Sales / totalSales : null,
    q4MonthCount: q4.length,
    selectedMonthCount: selected.length,
  };
}
