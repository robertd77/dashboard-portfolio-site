"use client";

import { TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatMonth, formatNumber, formatPercentage } from "@/lib/dashboard/format";
import { useDashboard } from "./dashboard-provider";

export function KpiCards() {
  const { kpis, filters } = useDashboard();
  const metrics = [
    { id: "net-sales", title: "Net Sales", value: formatCurrency(kpis.netSales), description: "Order totals after refunds. Includes tax and shipping." },
    { id: "orders", title: "Orders", value: formatNumber(kpis.orders), description: "Unique orders, including refunded and voided orders." },
    { id: "aov", title: "Average Order Value", value: formatCurrency(kpis.averageOrderValue), description: "Filtered net sales divided by unique orders." },
    { id: "gross-profit", title: "Gross Profit", value: formatCurrency(kpis.grossProfit), description: "Merchandise sales less product costs. Excludes operating expenses." },
    { id: "gross-margin", title: "Gross Margin", value: formatPercentage(kpis.grossMargin), description: "Total gross profit divided by merchandise net sales." },
  ];
  return (
    <section aria-labelledby="kpis-heading" className="mt-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 id="kpis-heading" className="text-lg font-semibold">Management snapshot</h2>
        <p role="status" className="text-sm text-muted-foreground">{formatMonth(filters.startMonth)} – {formatMonth(filters.endMonth)} · {filters.channel === "All" ? "All channels" : filters.channel}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <Card key={metric.id} role="group" aria-labelledby={`kpi-${metric.id}`}>
            <h3 id={`kpi-${metric.id}`} className="text-sm font-semibold">{metric.title}</h3>
            <p className="mt-4 whitespace-nowrap text-2xl font-semibold tracking-tight tabular-nums xl:text-xl">{metric.value}</p>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">{metric.description}</p>
          </Card>
        ))}
      </div>
      {kpis.orders === 0 && <p className="mt-5 rounded-lg border border-border bg-card p-4 text-sm leading-6 text-muted-foreground">No orders match this view. Totals are zero; Average Order Value and Gross Margin are unavailable. Try another month range or channel.</p>}
      {kpis.unverifiedCostLines > 0 && (
        <aside className="scope-note mt-5" aria-label="Product cost exceptions">
          <TriangleAlert size={20} className="shrink-0 text-primary" aria-hidden="true" />
          <p className="text-sm leading-6 text-muted-foreground">{formatNumber(kpis.unverifiedCostLines)} selected order lines have unresolved product costs. Gross Profit and Gross Margin include the reference zero-cost convention for these lines and remain provisional until review.</p>
        </aside>
      )}
    </section>
  );
}
