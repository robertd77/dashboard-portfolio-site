"use client";

import { useId, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceArea, ReferenceDot, XAxis, YAxis } from "recharts";
import type { TooltipContentProps, TooltipValueType } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { useDashboard } from "../dashboard-provider";
import { selectMonthlySales, selectMonthlySalesInsight, type MonthlySalesPoint } from "@/lib/dashboard/monthly-sales";
import { formatCompactCurrency, formatCurrency, formatMonth, formatNumber, formatPercentage, formatShortMonth } from "@/lib/dashboard/format";
import { ReportingChartCard } from "./chart-card";
import { ReportingChartTooltip, TooltipMetric, useChartTooltipTrigger } from "./chart-tooltip";
import { reportingChartStyle, salesChartConfig } from "./chart-theme";

function MonthlySalesTooltip(props: TooltipContentProps<TooltipValueType, string | number>) {
  const point: MonthlySalesPoint | undefined = props.payload?.[0]?.payload;
  if (!props.active || !point?.inRange) return null;
  return (
    <ReportingChartTooltip active={props.active} payload={props.payload} label={props.label} heading={formatMonth(point.month)}>
      <TooltipMetric label="Net Sales" value={formatCurrency(point.netSales)} emphasized />
      <TooltipMetric label="Orders" value={formatNumber(point.orders ?? 0)} />
      <TooltipMetric label="AOV" value={formatCurrency(point.averageOrderValue)} />
    </ReportingChartTooltip>
  );
}

export function MonthlySalesChart() {
  const { filteredData, filters, kpis } = useDashboard();
  const tooltipTrigger = useChartTooltipTrigger();
  const points = useMemo(() => selectMonthlySales(filteredData, filters), [filteredData, filters]);
  const insight = useMemo(() => selectMonthlySalesInsight(points), [points]);
  const gradientId = `sales-fill-${useId().replace(/:/g, "")}`;
  const holidayMonths = points.filter((point) => point.inRange && point.month >= "2025-10");
  const holidayHighlights = holidayMonths.filter((point) => point.month >= "2025-11" && (point.orders ?? 0) > 0);

  return (
    <ReportingChartCard id="monthly-sales" title="Monthly net sales"
      subtitle="A year of sales, one month at a time. Order totals after refunds, including tax and shipping."
      className="mt-5 scroll-mt-32 border-primary/15 border-t-4 border-t-[#138660] shadow-[0_6px_24px_-16px_#245c4640]"
      summary={<div className="rounded-xl border border-[#138660]/15 bg-[#edf8f1] px-4 py-3 sm:text-right"><p className="text-xs text-muted-foreground">Selected net sales · CAD</p><p data-testid="monthly-sales-total" className="mt-1 text-2xl font-semibold tracking-tight text-primary tabular-nums">{formatCurrency(kpis.netSales)}</p></div>}
      footer={
        <>
          {insight ? (
            <p data-testid="monthly-sales-insight" className="rounded-xl border border-[#bd741d]/15 bg-[#fff7e9] px-4 py-3 text-sm leading-7 text-muted-foreground">
              <span className="font-semibold text-foreground">{formatShortMonth(insight.peak.month)} leads this view</span> at {formatCompactCurrency(insight.peak.netSales ?? 0)}.
              {insight.q4MonthCount > 0 && <> {insight.q4MonthCount === 3 ? "Q4" : "Selected Q4 months"} contributes <span className="font-semibold text-foreground">{formatCompactCurrency(insight.q4Sales)}</span>{insight.q4Share !== null && <> ({formatPercentage(insight.q4Share)} of selected sales)</>}.</>}
            </p>
          ) : <p className="text-sm leading-6 text-muted-foreground">Choose a month range or channel with orders to explore the sales trend.</p>}
          <MonthlySalesTable points={points} />
        </>
      }>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="inline-flex items-center gap-2"><span className="h-1 w-5 rounded bg-[#138660]" />Net Sales</span>
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm border border-[#bd741d]/40 bg-[#bd741d]/25" />Q4 holiday period</span>
        </div>
        <span>2025 · {filters.channel === "All" ? "All channels" : filters.channel}</span>
      </div>
      {kpis.orders === 0 ? (
        <div className="mt-5 flex min-h-64 flex-col items-center justify-center rounded-lg bg-background px-5 text-center">
          <p className="font-semibold">No sales records in this view</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Try another month range or sales channel.</p>
        </div>
      ) : (
        <ChartContainer config={salesChartConfig} className="mt-4 h-64 w-full aspect-auto sm:h-80 [&_.recharts-surface:focus-visible]:outline-2 [&_.recharts-surface:focus-visible]:outline-offset-4 [&_.recharts-surface:focus-visible]:outline-ring" aria-label="Monthly net sales for 2025">
          <AreaChart data={points} margin={reportingChartStyle.margin} accessibilityLayer
            aria-label="Monthly net sales. Use left and right arrow keys to inspect months.">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-netSales)" stopOpacity={0.4} />
                <stop offset="60%" stopColor="var(--color-netSales)" stopOpacity={0.18} />
                <stop offset="100%" stopColor="var(--color-netSales)" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={reportingChartStyle.gridStroke} strokeDasharray="3 5" strokeOpacity={0.7} />
            <XAxis dataKey="month" tickFormatter={formatShortMonth} tickLine={false} axisLine={false} tickMargin={12} minTickGap={12} interval="preserveStartEnd" height={38} padding={{ left: 8, right: 8 }} />
            <YAxis tickFormatter={(value: number) => formatCompactCurrency(value, 0)} tickLine={false} axisLine={false} tickMargin={8} width={54} tickCount={5} domain={[0, "auto"]} />
            {holidayMonths.length > 1 && <ReferenceArea x1={holidayMonths[0].month} x2={holidayMonths.at(-1)!.month} fill="var(--color-holiday)" fillOpacity={0.13} strokeOpacity={0} />}
            <ChartTooltip content={MonthlySalesTooltip} trigger={tooltipTrigger} cursor={reportingChartStyle.cursor} isAnimationActive="auto" animationDuration={120} />
            <Area type="monotone" dataKey="netSales" name="Net Sales" stroke="var(--color-netSales)" strokeWidth={3.25}
              fill={`url(#${gradientId})`} connectNulls={false} isAnimationActive={false}
              dot={points.filter((point) => point.inRange).length === 1 ? { r: 4, fill: "var(--color-netSales)", stroke: "var(--card)", strokeWidth: 2 } : false}
              activeDot={{ r: 5, fill: "var(--color-netSales)", stroke: "var(--card)", strokeWidth: 3 }} />
            {holidayHighlights.map((point) => <ReferenceDot key={point.month} x={point.month} y={point.netSales!} r={5.5} fill="var(--color-holiday)" stroke="var(--card)" strokeWidth={2.5} />)}
          </AreaChart>
        </ChartContainer>
      )}
      <p className="mt-3 text-xs leading-5 text-muted-foreground">{tooltipTrigger === "click" ? "Tap a month" : "Hover or use the chart’s arrow keys"} to inspect monthly figures. Months outside the selected range are omitted.</p>
    </ReportingChartCard>
  );
}

function MonthlySalesTable({ points }: { points: MonthlySalesPoint[] }) {
  return (
    <details className="mt-4 text-xs text-muted-foreground">
      <summary className="w-fit cursor-pointer rounded font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">View monthly figures</summary>
      <div className="mt-3 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-80 text-right tabular-nums">
          <caption className="sr-only">Monthly net sales, distinct orders and average order value in CAD for the selected reporting view.</caption>
          <thead className="bg-background"><tr><th scope="col" className="px-3 py-3 text-left">Month</th><th scope="col" className="px-3 py-3">Net Sales</th><th scope="col" className="px-3 py-3">Orders</th><th scope="col" className="px-3 py-3">AOV</th></tr></thead>
          <tbody>{points.map((point) => <tr key={point.month} className="border-t border-border/60">
            <th scope="row" className="whitespace-nowrap px-3 py-2.5 text-left font-medium">{formatShortMonth(point.month)}</th>
            {point.inRange ? <><td className="whitespace-nowrap px-3 py-2.5">{formatCurrency(point.netSales)}</td><td className="px-3 py-2.5">{formatNumber(point.orders ?? 0)}</td><td className="whitespace-nowrap px-3 py-2.5">{formatCurrency(point.averageOrderValue)}</td></> : <td colSpan={3} className="px-3 py-2.5 text-center">Outside selected range</td>}
          </tr>)}</tbody>
        </table>
      </div>
    </details>
  );
}
