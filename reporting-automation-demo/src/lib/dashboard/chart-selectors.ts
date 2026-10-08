import { calculateDashboardKpis, DASHBOARD_MONTHS, filterDashboardData } from "./selectors";
import type { DashboardData, DashboardFilters, DashboardOrder, DashboardOrderLine } from "./types";

export const PRODUCT_CATEGORIES = ["Tops", "Sweaters & Hoodies", "Pants & Shorts", "Outerwear", "Accessories"];
export const LOW_COVERAGE_MONTHS = 2;

export function selectCategoryPerformance(data: DashboardData) {
  const groups = new Map<string, DashboardOrderLine[]>(PRODUCT_CATEGORIES.map((category) => [category, []]));
  const unmapped: DashboardOrderLine[] = [];
  for (const line of data.orderLines) (groups.get(line.category) ?? unmapped).push(line);
  const total = calculateDashboardKpis(data);
  const metric = (category: string, lines: DashboardOrderLine[]) => {
    const kpis = calculateDashboardKpis({ orders: [], orderLines: lines });
    return { category, revenue: kpis.merchandiseNetSales, grossProfit: kpis.grossProfit, grossMargin: kpis.grossMargin,
      revenueShare: total.merchandiseNetSales !== 0 ? kpis.merchandiseNetSales / total.merchandiseNetSales : null,
      lineCount: lines.length, unknownCostLines: kpis.unverifiedCostLines };
  };
  return {
    categories: [...groups].map(([category, lines]) => metric(category, lines)).sort((a, b) => b.revenue - a.revenue || a.category.localeCompare(b.category)),
    unmapped: metric("Unmapped", unmapped), totalRevenue: total.merchandiseNetSales, totalProfit: total.grossProfit,
  };
}

export type CategoryPoint = ReturnType<typeof selectCategoryPerformance>["categories"][number];

/** Product styles aggregate all master SKUs exactly once; inventory is never joined onto sales rows. */
export function selectProductPerformance(allData: DashboardData, filteredData: DashboardData, filters: DashboardFilters, limit = 8) {
  const endIndex = DASHBOARD_MONTHS.indexOf(filters.endMonth);
  if (endIndex < 0) throw new Error("Unknown inventory reporting month.");
  const firstAvailable = allData.orders.reduce((first, order) => order.month < first ? order.month : first, filters.endMonth);
  const startIndex = Math.max(0, endIndex - 2, DASHBOARD_MONTHS.indexOf(firstAvailable));
  const windowStart = DASHBOARD_MONTHS[startIndex];
  const windowMonths = endIndex - startIndex + 1;
  const recent = filterDashboardData(allData, { startMonth: windowStart, endMonth: filters.endMonth, channel: filters.channel });
  const bySku = new Map(allData.products.map((product) => [product.sku, product]));
  const styles = new Map<string, { name: string; revenue: number; inventory: number; units: number; recentUnits: number; lineCount: number }>();
  for (const product of bySku.values()) {
    const style = styles.get(product.name) ?? { name: product.name, revenue: 0, inventory: 0, units: 0, recentUnits: 0, lineCount: 0 };
    style.inventory += product.inventory;
    styles.set(product.name, style);
  }
  let unmappedRevenue = 0;
  for (const line of filteredData.orderLines) {
    const product = bySku.get(line.sku);
    if (!product) { unmappedRevenue += line.merchandiseNetSales; continue; }
    const style = styles.get(product.name)!;
    style.revenue += line.merchandiseNetSales;
    style.lineCount += 1;
    // Recorded quantities are not inferred from refund amounts; voids were never sales.
    if (line.financialStatus !== "voided") style.units += line.quantity;
  }
  for (const line of recent.orderLines) {
    const product = bySku.get(line.sku);
    if (product && line.financialStatus !== "voided") styles.get(product.name)!.recentUnits += line.quantity;
  }
  const ranked = [...styles.values()].filter((style) => style.lineCount > 0).map((style) => {
    const monthlyVelocity = style.recentUnits / windowMonths;
    const coverage = monthlyVelocity > 0 ? style.inventory / monthlyVelocity : null;
    return { ...style, monthlyVelocity, coverage, lowStock: coverage !== null && coverage < LOW_COVERAGE_MONTHS };
  }).sort((a, b) => b.revenue - a.revenue || a.name.localeCompare(b.name));
  return { products: ranked.slice(0, limit), ranked, windowStart, windowEnd: filters.endMonth, windowMonths, unmappedRevenue };
}

export type ProductPoint = ReturnType<typeof selectProductPerformance>["products"][number];
export type PurchaseType = "first" | "repeat" | "guest";

/** Classify full order history before month/channel selection; dates preserve source local time. */
export function classifyCustomerPurchases(orders: DashboardOrder[]): ReadonlyMap<string, PurchaseType> {
  const unique = [...new Map(orders.map((order) => [order.orderId, order])).values()];
  unique.sort((a, b) => a.orderDate.localeCompare(b.orderDate) || a.orderId.localeCompare(b.orderId));
  const seen = new Set<string>();
  const types = new Map<string, PurchaseType>();
  for (const order of unique) {
    const type = !order.customerId ? "guest" : seen.has(order.customerId) ? "repeat" : "first";
    types.set(order.orderId, type);
    if (order.customerId) seen.add(order.customerId);
  }
  return types;
}

export function selectCustomerPurchaseMix(data: DashboardData, filters: DashboardFilters, types: ReadonlyMap<string, PurchaseType>) {
  const months = DASHBOARD_MONTHS.map((month) => {
    const inRange = month >= filters.startMonth && month <= filters.endMonth;
    return { month, inRange, firstRevenue: inRange ? 0 : null as number | null, repeatRevenue: inRange ? 0 : null as number | null,
      guestRevenue: inRange ? 0 : null as number | null, firstOrders: 0, repeatOrders: 0, guestOrders: 0, totalRevenue: 0 };
  });
  const byMonth = new Map(months.map((point) => [point.month, point]));
  for (const order of new Map(data.orders.map((order) => [order.orderId, order])).values()) {
    const point = byMonth.get(order.month);
    if (!point?.inRange) continue;
    const type = types.get(order.orderId);
    if (!type) throw new Error("Order is missing its full-history purchase classification.");
    point[`${type}Revenue`] = (point[`${type}Revenue`] ?? 0) + order.netSales;
    point[`${type}Orders`] += 1;
    point.totalRevenue += order.netSales;
  }
  const firstRevenue = months.reduce((sum, point) => sum + (point.firstRevenue ?? 0), 0);
  const repeatRevenue = months.reduce((sum, point) => sum + (point.repeatRevenue ?? 0), 0);
  const guestRevenue = months.reduce((sum, point) => sum + (point.guestRevenue ?? 0), 0);
  return { months, firstRevenue, repeatRevenue, guestRevenue, repeatShare: firstRevenue + repeatRevenue > 0 ? repeatRevenue / (firstRevenue + repeatRevenue) : null,
    firstOrders: months.reduce((sum, point) => sum + point.firstOrders, 0), repeatOrders: months.reduce((sum, point) => sum + point.repeatOrders, 0), guestOrders: months.reduce((sum, point) => sum + point.guestOrders, 0) };
}

export type CustomerMixPoint = ReturnType<typeof selectCustomerPurchaseMix>["months"][number];
