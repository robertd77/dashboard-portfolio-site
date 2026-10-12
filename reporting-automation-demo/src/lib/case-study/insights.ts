import { selectCategoryPerformance, selectProductPerformance } from "../dashboard/chart-selectors";
import { selectMonthlySales } from "../dashboard/monthly-sales";
import { calculateDashboardKpis, DEFAULT_DASHBOARD_FILTERS, filterDashboardData } from "../dashboard/selectors";
import type { DashboardData } from "../dashboard/types";

/** A fixed 2025 / all-channel story using the same reporting definitions as the demo. */
export function selectCaseStudyInsights(data: DashboardData) {
  const annual = filterDashboardData(data, DEFAULT_DASHBOARD_FILTERS);
  const kpis = calculateDashboardKpis(annual);
  const months = selectMonthlySales(annual, DEFAULT_DASHBOARD_FILTERS);
  const quarters = Array.from({ length: 4 }, (_, index) => ({
    label: `Q${index + 1}`,
    netSales: months.slice(index * 3, index * 3 + 3).reduce((sum, month) => sum + (month.netSales ?? 0), 0),
  }));
  const q3Sales = quarters[2].netSales;
  const q4Sales = quarters[3].netSales;
  const categories = selectCategoryPerformance(annual);
  const inventory = selectProductPerformance(data, annual, DEFAULT_DASHBOARD_FILTERS);
  return {
    kpis, lineCount: annual.orderLines.length, quarters, q4Sales,
    q4Growth: q3Sales > 0 ? (q4Sales - q3Sales) / q3Sales : null,
    q4Share: kpis.netSales > 0 ? q4Sales / kpis.netSales : null,
    categories, outerwear: categories.categories.find((point) => point.category === "Outerwear")!,
    inventory,
  };
}

export type CaseStudyInsights = ReturnType<typeof selectCaseStudyInsights>;
