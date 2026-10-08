"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { TooltipContentProps, TooltipValueType } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { useDashboard } from "../dashboard-provider";
import { classifyCustomerPurchases, selectCustomerPurchaseMix, type CustomerMixPoint } from "@/lib/dashboard/chart-selectors";
import { formatCompactCurrency, formatCurrency, formatMonth, formatNumber, formatPercentage, formatShortMonth } from "@/lib/dashboard/format";
import { ReportingChartCard } from "./chart-card";
import { ReportingChartTooltip, TooltipMetric, useChartTooltipTrigger } from "./chart-tooltip";
import { ReportingEmpty, ReportingFigures, ReportingInsight, ReportingLegend, ReportingSummary } from "./chart-support";
import { customerChartConfig, reportingCardClass, reportingChartStyle, reportingPlotClass } from "./chart-theme";

function CustomerTooltip(props: TooltipContentProps<TooltipValueType, string | number>) {
  const point: CustomerMixPoint | undefined = props.payload?.[0]?.payload;
  if (!props.active || !point?.inRange) return null;
  return <ReportingChartTooltip active={props.active} payload={props.payload} label={props.label} heading={formatMonth(point.month)}>
    {(["first", "repeat", "guest"] as const).map((type) => <div key={type} className="grid gap-1">
      <TooltipMetric label={type === "first" ? "First purchase" : type === "repeat" ? "Repeat purchase" : "Guest / unidentified"} value={formatCurrency(point[`${type}Revenue`])} emphasized={type === "repeat"} />
      <TooltipMetric label="Share · orders" value={<>{formatPercentage(point.totalRevenue !== 0 ? (point[`${type}Revenue`] ?? 0) / point.totalRevenue : null)} · {formatNumber(point[`${type}Orders`])}</>} />
    </div>)}
  </ReportingChartTooltip>;
}

export function CustomerPurchaseMixChart() {
  const { data, filteredData, filters, kpis } = useDashboard();
  const types = useMemo(() => classifyCustomerPurchases(data.orders), [data.orders]);
  const result = useMemo(() => selectCustomerPurchaseMix(filteredData, filters, types), [filteredData, filters, types]);
  const trigger = useChartTooltipTrigger();
  return <ReportingChartCard id="customer-purchase-mix" title="Customer purchase mix"
    subtitle="First and repeat purchases within the 2025 order history. Guest orders stay separate; revenue includes tax and shipping."
    className={reportingCardClass}
    summary={<ReportingSummary label="Repeat share of identified-customer sales" value={formatPercentage(result.repeatShare)} />}
    footer={<>
      {kpis.orders > 0 && <ReportingInsight>{result.repeatShare !== null ? <><span className="font-semibold text-foreground">Repeat purchases contribute {formatPercentage(result.repeatShare)}</span> of identified-customer revenue in this view, across {formatNumber(result.repeatOrders)} orders.</> : <>No identified-customer revenue is available in this view.</>} Guest / unidentified orders contribute {formatCurrency(result.guestRevenue)} across {formatNumber(result.guestOrders)} orders.</ReportingInsight>}
      <p className="mt-3 text-xs leading-6 text-muted-foreground">First purchase means the earliest recorded order for a Customer ID in the full dataset, before date or channel filters. This is within-dataset purchase behavior, not lifetime customer retention.</p>
      <ReportingFigures title="View customer mix figures" caption="Monthly order-level first, repeat and guest revenue in CAD and distinct order counts, classified from the full history."
        columns={["Month", "First sales", "First orders", "Repeat sales", "Repeat orders", "Guest sales", "Guest orders"]}
        rows={result.months.filter((point) => point.inRange).map((point) => ({ key: point.month, cells: [formatShortMonth(point.month), formatCurrency(point.firstRevenue), formatNumber(point.firstOrders), formatCurrency(point.repeatRevenue), formatNumber(point.repeatOrders), formatCurrency(point.guestRevenue), formatNumber(point.guestOrders)] }))} />
    </>}>
    <ReportingLegend config={customerChartConfig} />
    {!kpis.orders ? <ReportingEmpty message="No customer purchase records in this view." /> : <ChartContainer config={customerChartConfig} className={`${reportingPlotClass} h-80 sm:h-96`}>
      <BarChart data={result.months} margin={reportingChartStyle.margin} stackOffset="sign" accessibilityLayer aria-label="Monthly first, repeat, and guest purchase revenue. Use arrow keys to inspect months.">
        <CartesianGrid vertical={false} stroke={reportingChartStyle.gridStroke} strokeDasharray="3 5" strokeOpacity={0.7} />
        <XAxis dataKey="month" tickFormatter={formatShortMonth} tickLine={false} axisLine={false} tickMargin={12} minTickGap={12} interval="preserveStartEnd" height={38} />
        <YAxis tickFormatter={(v: number) => formatCompactCurrency(v, 0)} axisLine={false} tickLine={false} tickMargin={8} width={54} tickCount={5} />
        <ChartTooltip content={CustomerTooltip} trigger={trigger} position={trigger === "click" ? { x: 0 } : undefined} cursor={{ fill: "var(--secondary)", fillOpacity: 0.5 }} isAnimationActive="auto" animationDuration={120} />
        <Bar dataKey="firstRevenue" name="First purchase" stackId="purchases" fill="var(--color-firstRevenue)" maxBarSize={46} isAnimationActive={false} />
        <Bar dataKey="repeatRevenue" name="Repeat purchase" stackId="purchases" fill="var(--color-repeatRevenue)" maxBarSize={46} isAnimationActive={false} />
        <Bar dataKey="guestRevenue" name="Guest / unidentified" stackId="purchases" fill="var(--color-guestRevenue)" maxBarSize={46} radius={[4, 4, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ChartContainer>}
    <p className="mt-3 text-xs leading-5 text-muted-foreground">{trigger === "click" ? "Tap a month" : "Hover or use the chart’s arrow keys"} for revenue, shares of monthly sales, and order counts.</p>
  </ReportingChartCard>;
}
