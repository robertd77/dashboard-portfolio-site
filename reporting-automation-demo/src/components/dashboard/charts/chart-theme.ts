import type { ChartConfig } from "@/components/ui/chart";

export const salesChartConfig = {
  netSales: { label: "Net Sales", color: "var(--primary)" },
  holiday: { label: "Q4 holiday period", color: "#9a642b" },
} satisfies ChartConfig;

export const reportingChartStyle = {
  gridStroke: "var(--border)",
  axisColor: "var(--muted-foreground)",
  cursor: { stroke: "var(--primary)", strokeOpacity: 0.25, strokeDasharray: "4 4" },
  margin: { top: 18, right: 14, bottom: 0, left: 0 },
};
