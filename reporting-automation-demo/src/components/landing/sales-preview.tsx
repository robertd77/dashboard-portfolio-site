"use client";

import { useId } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceArea, ReferenceDot, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { MonthlySalesTooltip } from "@/components/dashboard/charts/monthly-sales-chart";
import { useChartTooltipTrigger } from "@/components/dashboard/charts/chart-tooltip";
import { reportingChartStyle, salesChartConfig } from "@/components/dashboard/charts/chart-theme";
import { formatCompactCurrency, formatCurrency, formatShortMonth } from "@/lib/dashboard/format";
import type { MonthlySalesPoint } from "@/lib/dashboard/monthly-sales";

export function SalesPreview({ points, total }: { points: MonthlySalesPoint[]; total: number }) {
  const gradient = `preview-${useId().replace(/:/g, "")}`;
  const trigger = useChartTooltipTrigger();
  return <figure className="min-w-0 rounded-2xl border border-primary/15 border-t-4 border-t-[#138660] bg-card p-5 shadow-[0_12px_36px_-20px_#245c4640] sm:p-6" aria-labelledby="preview-title">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h3 id="preview-title" className="text-base font-semibold">Monthly net sales</h3><p className="mt-1 text-xs text-muted-foreground">2025 · All channels · CAD</p></div>
      <div className="rounded-lg bg-[#edf8f1] px-3 py-2"><p className="text-[11px] text-muted-foreground">Annual net sales</p><p data-testid="landing-sales-total" className="mt-1 text-xl font-semibold tracking-tight text-primary">{formatCurrency(total)}</p></div>
    </div>
    <div className="mt-5 flex flex-wrap gap-4 text-[11px] text-muted-foreground"><span className="inline-flex items-center gap-2"><span className="h-1 w-4 rounded bg-[#138660]" />Net sales</span><span className="inline-flex items-center gap-2"><span className="size-2 rounded-sm bg-[#bd741d]/40" />Q4 holiday period</span></div>
    <ChartContainer config={salesChartConfig} className="mt-4 h-60 w-full aspect-auto sm:h-72 [&_.recharts-surface:focus-visible]:outline-2 [&_.recharts-surface:focus-visible]:outline-ring">
      <AreaChart data={points} margin={{ top: 12, right: 10, bottom: 0, left: 0 }} accessibilityLayer aria-label="Northwood monthly net sales. Use arrow keys to inspect months.">
        <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-netSales)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--color-netSales)" stopOpacity={0.03} /></linearGradient></defs>
        <CartesianGrid vertical={false} stroke={reportingChartStyle.gridStroke} strokeDasharray="3 5" strokeOpacity={0.7} />
        <XAxis dataKey="month" tickFormatter={formatShortMonth} axisLine={false} tickLine={false} tickMargin={10} minTickGap={16} interval="preserveStartEnd" height={32} padding={{ left: 6, right: 6 }} />
        <YAxis tickFormatter={(value: number) => formatCompactCurrency(value, 0)} axisLine={false} tickLine={false} width={48} tickCount={4} domain={[0, "auto"]} />
        <ReferenceArea x1="2025-10" x2="2025-12" fill="var(--color-holiday)" fillOpacity={0.13} strokeOpacity={0} />
        <ChartTooltip content={MonthlySalesTooltip} trigger={trigger} position={trigger === "click" ? { x: 0 } : undefined} cursor={reportingChartStyle.cursor} isAnimationActive="auto" animationDuration={120} />
        <Area dataKey="netSales" type="monotone" stroke="var(--color-netSales)" strokeWidth={3} fill={`url(#${gradient})`} isAnimationActive={false} dot={false} activeDot={{ r: 4, fill: "var(--color-netSales)", stroke: "white", strokeWidth: 2 }} />
        {points.filter((point) => point.month >= "2025-11" && point.netSales !== null).map((point) => <ReferenceDot key={point.month} x={point.month} y={point.netSales!} r={5} fill="var(--color-holiday)" stroke="white" strokeWidth={2} />)}
      </AreaChart>
    </ChartContainer>
    <figcaption className="mt-3 text-xs leading-5 text-muted-foreground">Real demo figures after refunds, including tax and shipping. {trigger === "click" ? "Tap" : "Hover or use arrow keys"} to inspect a month.</figcaption>
    <details className="mt-3 text-xs text-muted-foreground"><summary className="w-fit cursor-pointer rounded font-medium focus-visible:outline-2 focus-visible:outline-ring">View monthly figures</summary><div className="mt-3 overflow-x-auto rounded-lg border border-border"><table className="w-full min-w-72 text-right tabular-nums"><caption className="sr-only">Northwood monthly net sales in CAD, distinct orders, and average order value.</caption><thead className="bg-background"><tr><th scope="col" className="p-3 text-left">Month</th><th scope="col" className="p-3">Net sales</th><th scope="col" className="p-3">Orders</th><th scope="col" className="p-3">AOV</th></tr></thead><tbody>{points.map((point) => <tr key={point.month} className="border-t border-border"><th scope="row" className="p-3 text-left font-medium">{formatShortMonth(point.month)}</th><td className="whitespace-nowrap p-3">{formatCurrency(point.netSales)}</td><td className="p-3">{point.orders}</td><td className="whitespace-nowrap p-3">{formatCurrency(point.averageOrderValue)}</td></tr>)}</tbody></table></div></details>
  </figure>;
}
