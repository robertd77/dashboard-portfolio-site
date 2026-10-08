"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import type { TooltipContentProps, TooltipValueType } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { useDashboard } from "../dashboard-provider";
import { selectProductPerformance, type ProductPoint } from "@/lib/dashboard/chart-selectors";
import { formatCompactCurrency, formatCurrency, formatMonth, formatNumber, formatStockCoverage } from "@/lib/dashboard/format";
import { ReportingChartCard } from "./chart-card";
import { ReportingChartTooltip, TooltipMetric, useChartTooltipTrigger } from "./chart-tooltip";
import { ReportingEmpty, ReportingFigures, ReportingInsight, ReportingLegend, ReportingSummary } from "./chart-support";
import { productChartConfig, reportingCardClass, reportingChartStyle, reportingPlotClass } from "./chart-theme";

function ProductTooltip(props: TooltipContentProps<TooltipValueType, string | number>) {
  const point: ProductPoint | undefined = props.payload?.[0]?.payload;
  if (!props.active || !point) return null;
  return <ReportingChartTooltip active={props.active} payload={props.payload} label={props.label} heading={point.name}>
    <TooltipMetric label="Revenue" value={formatCurrency(point.revenue)} emphasized />
    <TooltipMetric label="Units sold" value={formatNumber(point.units)} />
    <TooltipMetric label="Current stock" value={formatNumber(point.inventory)} />
    <TooltipMetric label="Units / month" value={new Intl.NumberFormat("en-CA", { maximumFractionDigits: 1 }).format(point.monthlyVelocity)} />
    <TooltipMetric label="Est. coverage" value={formatStockCoverage(point.coverage)} />
  </ReportingChartTooltip>;
}

export function ProductInventoryChart() {
  const { data, filteredData, filters } = useDashboard();
  const result = useMemo(() => selectProductPerformance(data, filteredData, filters), [data, filteredData, filters]);
  const trigger = useChartTooltipTrigger();
  const leader = result.products[0];
  const lowCount = result.products.filter((product) => product.lowStock).length;
  return <ReportingChartCard id="product-inventory" title="Product & inventory coverage"
    subtitle="The strongest-selling product styles, including all variants. Amber marks less than two months of estimated stock."
    className={reportingCardClass}
    summary={<ReportingSummary label="Top products needing stock attention" value={`${lowCount} / ${result.products.length}`} />}
    footer={<>
      {leader && <ReportingInsight><span className="font-semibold text-foreground">{leader.name} is the top seller</span> at {formatCompactCurrency(leader.revenue)}. {lowCount > 0 ? `${lowCount} of these ${result.products.length} products have under two months of estimated stock.` : "None of these products with recent sales has under two months of estimated stock."}</ReportingInsight>}
      <p className="mt-3 text-xs leading-6 text-muted-foreground">Velocity: {formatMonth(result.windowStart)} – {formatMonth(result.windowEnd)} ({result.windowMonths} {result.windowMonths === 1 ? "available month" : "months"}), using {filters.channel === "All" ? "all channels" : filters.channel}. Current inventory is a shared snapshot, not historical or channel-allocated stock. Coverage is an operational estimate, not a forecast.</p>
      <p className="mt-1 text-xs leading-6 text-muted-foreground">Units use recorded quantities on non-voided lines; refunds do not reveal returned-unit counts. {result.unmappedRevenue !== 0 && <>Unmatched SKUs contribute {formatCurrency(result.unmappedRevenue)} in retained revenue and are excluded from product rankings.</>}</p>
      <ReportingFigures title="View product & stock figures" caption="Top product styles by selected merchandise revenue, recorded units, current shared inventory, and estimated months of coverage."
        columns={["Product", "Revenue", "Units", "Stock", "Coverage"]}
        rows={result.products.map((product) => ({ key: product.name, cells: [product.name, formatCurrency(product.revenue), formatNumber(product.units), formatNumber(product.inventory), <span key="coverage" className={product.lowStock ? "font-semibold text-[#985914]" : ""}>{formatStockCoverage(product.coverage)}</span>] }))} />
    </>}>
    <ReportingLegend config={productChartConfig} />
    {!leader ? <ReportingEmpty message="No matched product sales in this view." /> : <ChartContainer config={productChartConfig} className={`${reportingPlotClass} h-[420px]`}>
      <BarChart data={result.products} layout="vertical" margin={{ top: 8, right: 12, bottom: 0, left: 0 }} accessibilityLayer aria-label="Top product merchandise sales and inventory coverage. Use arrow keys to inspect products.">
        <CartesianGrid horizontal={false} stroke={reportingChartStyle.gridStroke} strokeDasharray="3 5" strokeOpacity={0.7} />
        <XAxis type="number" tickFormatter={(v: number) => formatCompactCurrency(v, 0)} axisLine={false} tickLine={false} tickMargin={8} tickCount={4} />
        <YAxis type="category" dataKey="name" width={128} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <ChartTooltip content={ProductTooltip} trigger={trigger} position={trigger === "click" ? { x: 0 } : undefined} cursor={{ fill: "var(--secondary)", fillOpacity: 0.5 }} isAnimationActive="auto" animationDuration={120} />
        <Bar dataKey="revenue" name="Merchandise revenue" radius={[0, 5, 5, 0]} maxBarSize={26} isAnimationActive={false}>{result.products.map((product) => <Cell key={product.name} fill={product.lowStock ? "var(--color-lowStock)" : "var(--color-revenue)"} />)}</Bar>
      </BarChart>
    </ChartContainer>}
    <p className="mt-3 text-xs leading-5 text-muted-foreground">{trigger === "click" ? "Tap" : "Hover or use arrow keys on"} a product for sales, units, current stock, and coverage.</p>
  </ReportingChartCard>;
}
