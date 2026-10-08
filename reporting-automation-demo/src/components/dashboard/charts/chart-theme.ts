import type { ChartConfig } from "@/components/ui/chart";

export const salesChartConfig = {
  netSales: { label: "Net Sales", color: "#138660" },
  holiday: { label: "Q4 holiday period", color: "#bd741d" },
} satisfies ChartConfig;

export const reportingChartStyle = {
  gridStroke: "var(--border)",
  axisColor: "var(--muted-foreground)",
  cursor: { stroke: "var(--primary)", strokeOpacity: 0.25, strokeDasharray: "4 4" },
  margin: { top: 18, right: 14, bottom: 0, left: 0 },
};

export const categoryChartConfig = {
  revenue: { label: "Merchandise revenue", color: "#138660" },
  grossProfit: { label: "Gross profit", color: "#bd741d" },
} satisfies ChartConfig;

export const productChartConfig = {
  revenue: { label: "Merchandise revenue", color: "#138660" },
  lowStock: { label: "Under 2 months of stock", color: "#bd741d" },
} satisfies ChartConfig;

export const customerChartConfig = {
  firstRevenue: { label: "First purchase", color: "#9ccfba" },
  repeatRevenue: { label: "Repeat purchase", color: "#138660" },
  guestRevenue: { label: "Guest / unidentified", color: "#8e9d95" },
} satisfies ChartConfig;

export const reportingCardClass = "scroll-mt-32 border-primary/15 border-t-4 border-t-[#138660] shadow-[0_6px_24px_-16px_#245c4640]";
export const reportingPlotClass = "mt-4 w-full aspect-auto [&_.recharts-surface:focus-visible]:outline-2 [&_.recharts-surface:focus-visible]:outline-offset-4 [&_.recharts-surface:focus-visible]:outline-ring";
