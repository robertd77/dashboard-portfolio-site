"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import type { TooltipContentProps, TooltipValueType } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { useDashboard } from "../dashboard-provider";
import { selectCategoryPerformance, type CategoryPoint } from "@/lib/dashboard/chart-selectors";
import { formatCompactCurrency, formatCurrency, formatNumber, formatPercentage } from "@/lib/dashboard/format";
import { ReportingChartCard } from "./chart-card";
import { ReportingChartTooltip, TooltipMetric, useChartTooltipTrigger } from "./chart-tooltip";
import { ReportingEmpty, ReportingFigures, ReportingInsight, ReportingLegend, ReportingSummary } from "./chart-support";
import { categoryChartConfig, reportingCardClass, reportingChartStyle, reportingPlotClass } from "./chart-theme";

function CategoryTooltip(props: TooltipContentProps<TooltipValueType, string | number>) {
  const point: CategoryPoint | undefined = props.payload?.[0]?.payload;
  if (!props.active || !point) return null;
  return <ReportingChartTooltip active={props.active} payload={props.payload} label={props.label} heading={point.category}>
    <TooltipMetric label="Revenue" value={formatCurrency(point.revenue)} emphasized />
    <TooltipMetric label="Gross profit" value={formatCurrency(point.grossProfit)} />
    <TooltipMetric label="Gross margin" value={formatPercentage(point.grossMargin)} />
    <TooltipMetric label="Revenue share" value={formatPercentage(point.revenueShare)} />
  </ReportingChartTooltip>;
}

export function CategoryPerformanceChart() {
  const { filteredData } = useDashboard();
  const result = useMemo(() => selectCategoryPerformance(filteredData), [filteredData]);
  const trigger = useChartTooltipTrigger();
  const leader = result.categories.find((point) => point.lineCount > 0);
  const figures = [...result.categories, ...(result.unmapped.lineCount ? [result.unmapped] : [])];
  return <ReportingChartCard id="category-performance" title="Category performance"
    subtitle="Compare merchandise revenue and gross profit. Product-level revenue excludes order tax and shipping."
    className={reportingCardClass}
    summary={<ReportingSummary label="Selected merchandise revenue · CAD" value={formatCurrency(result.totalRevenue)} />}
    footer={<>
      {leader && <ReportingInsight><span className="font-semibold text-foreground">{leader.category} leads merchandise sales</span> at {formatCompactCurrency(leader.revenue)}{leader.revenueShare !== null && <> ({formatPercentage(leader.revenueShare)} of selected revenue)</>}. Its gross margin is {formatPercentage(leader.grossMargin)}.</ReportingInsight>}
      {result.unmapped.lineCount > 0 && <p className="mt-3 text-xs leading-6 text-muted-foreground">{formatNumber(result.unmapped.lineCount)} lines await a category match: {formatCurrency(result.unmapped.revenue)} revenue and {formatCurrency(result.unmapped.grossProfit)} provisional profit. These remain in the totals and the figures below, outside the five category bars.</p>}
      <ReportingFigures title="View category figures" caption="Category merchandise revenue, gross profit, weighted margin and share of all selected merchandise revenue in CAD. Unmapped lines remain included."
        columns={["Category", "Revenue", "Gross profit", "Margin", "Revenue share"]}
        rows={figures.map((point) => ({ key: point.category, cells: [point.category, formatCurrency(point.revenue), formatCurrency(point.grossProfit), formatPercentage(point.grossMargin), formatPercentage(point.revenueShare)] }))} />
    </>}>
    <ReportingLegend config={categoryChartConfig} />
    {!filteredData.orderLines.length ? <ReportingEmpty message="No merchandise records in this view." /> : <ChartContainer config={categoryChartConfig} className={`${reportingPlotClass} h-80 sm:h-96`}>
      <BarChart data={result.categories} layout="vertical" margin={{ top: 12, right: 12, bottom: 0, left: 0 }} accessibilityLayer aria-label="Category revenue and gross profit. Use arrow keys to inspect categories.">
        <CartesianGrid horizontal={false} stroke={reportingChartStyle.gridStroke} strokeDasharray="3 5" strokeOpacity={0.7} />
        <XAxis type="number" tickFormatter={(v: number) => formatCompactCurrency(v, 0)} axisLine={false} tickLine={false} tickMargin={8} tickCount={4} />
        <YAxis type="category" dataKey="category" width={126} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <ChartTooltip content={CategoryTooltip} trigger={trigger} position={trigger === "click" ? { x: 0 } : undefined} cursor={{ fill: "var(--secondary)", fillOpacity: 0.5 }} isAnimationActive="auto" animationDuration={120} />
        <Bar dataKey="revenue" name="Merchandise revenue" fill="var(--color-revenue)" radius={[0, 4, 4, 0]} maxBarSize={18} isAnimationActive={false}>{result.categories.map((point) => <Cell key={point.category} fillOpacity={point.category === leader?.category ? 1 : 0.72} />)}</Bar>
        <Bar dataKey="grossProfit" name="Gross profit" fill="var(--color-grossProfit)" radius={[0, 4, 4, 0]} maxBarSize={18} isAnimationActive={false} />
      </BarChart>
    </ChartContainer>}
    <p className="mt-3 text-xs leading-5 text-muted-foreground">{trigger === "click" ? "Tap" : "Hover or use arrow keys on"} a category for revenue, profit, margin, and share.</p>
  </ReportingChartCard>;
}
