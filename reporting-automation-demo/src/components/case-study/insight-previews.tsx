import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CaseStudyInsights } from "@/lib/case-study/insights";
import { formatCompactCurrency, formatCurrency, formatNumber, formatPercentage, formatStockCoverage } from "@/lib/dashboard/format";

const cardClass = "flex min-w-0 flex-col rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6";

function ChartLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-primary hover:underline">{children}<ArrowUpRight className="size-4" aria-hidden="true" /></Link>;
}

export function InsightPreviews({ insights }: { insights: CaseStudyInsights }) {
  const { quarters, q4Sales, q4Growth, q4Share, categories, outerwear, inventory } = insights;
  const quarterMax = Math.max(0, ...quarters.map((quarter) => quarter.netSales));
  const categoryMax = Math.max(0, ...categories.categories.map((category) => category.revenue));
  const products = inventory.products.slice(0, 3);
  return <div className="mt-8 grid gap-5 lg:grid-cols-3">
    <article className={cardClass} aria-labelledby="seasonality-title">
      <p className="eyebrow">01 / Seasonal demand</p>
      <h3 id="seasonality-title" className="text-xl font-semibold tracking-tight">The holiday quarter stands out</h3>
      <p className="mt-5 text-3xl font-semibold tracking-tight text-primary" data-testid="case-q4-sales">{formatCompactCurrency(q4Sales)}</p>
      <p className="mt-1 text-xs text-muted-foreground">Q4 order-level net sales · CAD</p>
      <figure className="mt-6">
        <ol className="grid grid-cols-4 items-end gap-3">
          {quarters.map((quarter, index) => <li key={quarter.label} aria-label={`${quarter.label}: ${formatCurrency(quarter.netSales)} CAD net sales`}>
            <div className="flex h-32 items-end rounded-md bg-secondary/60" aria-hidden="true"><div className={`w-full rounded-t-md ${index === 3 ? "bg-[#bd741d]" : "bg-[#138660]/75"}`} style={{ height: `${quarterMax > 0 ? Math.max(0, quarter.netSales) / quarterMax * 100 : 0}%` }} /></div>
            <p className="mt-3 text-center text-xs font-semibold">{quarter.label}</p>
            <p className="mt-1 text-center text-[11px] text-muted-foreground" aria-hidden="true">{formatCompactCurrency(quarter.netSales, 0)}</p>
          </li>)}
        </ol>
        <figcaption className="mt-4 text-xs leading-5 text-muted-foreground">2025 quarterly net sales, including tax and shipping.</figcaption>
      </figure>
      <p className="mt-5 text-sm leading-6 text-muted-foreground">{q4Growth !== null ? <>Q4 sales were <strong className="font-semibold text-foreground">{formatPercentage(Math.abs(q4Growth))} {q4Growth >= 0 ? "higher" : "lower"} than Q3</strong> of 2025, contributing {formatPercentage(q4Share)} of the year’s net sales.</> : "A quarter-to-quarter comparison is unavailable for this reporting view."} A useful signal for seasonal planning, without attributing the change to a particular campaign.</p>
      <ChartLink href="/dashboard#monthly-sales-title">Explore monthly sales</ChartLink>
    </article>
    <article className={cardClass} aria-labelledby="category-story-title">
      <p className="eyebrow">02 / Product economics</p>
      <h3 id="category-story-title" className="text-xl font-semibold tracking-tight">Outerwear earns attention</h3>
      <p className="mt-5 text-3xl font-semibold tracking-tight text-primary" data-testid="case-outerwear-sales">{formatCompactCurrency(outerwear.revenue)}</p>
      <p className="mt-1 text-xs text-muted-foreground">Outerwear merchandise revenue · CAD</p>
      <figure className="mt-6">
        <ul className="grid gap-4">
          {categories.categories.map((category) => <li key={category.category} aria-label={`${category.category}: ${formatCurrency(category.revenue)} CAD merchandise revenue`}>
            <div className="mb-1.5 flex flex-wrap justify-between gap-x-2 text-xs" aria-hidden="true"><span>{category.category}</span><span className="font-semibold tabular-nums">{formatCompactCurrency(category.revenue, 0)}</span></div>
            <div className="h-2 rounded-full bg-secondary" aria-hidden="true"><div className={`h-full rounded-full ${category.category === "Outerwear" ? "bg-[#138660]" : "bg-[#138660]/50"}`} style={{ width: `${categoryMax > 0 ? Math.max(0, category.revenue) / categoryMax * 100 : 0}%` }} /></div>
          </li>)}
        </ul>
        <figcaption className="mt-4 text-xs leading-5 text-muted-foreground">2025 merchandise revenue by category; excludes order-level tax and shipping.</figcaption>
      </figure>
      <p className="mt-5 text-sm leading-6 text-muted-foreground">Outerwear contributes <strong className="font-semibold text-foreground">{formatPercentage(outerwear.revenueShare)} of merchandise revenue</strong>, with a {formatPercentage(outerwear.grossMargin)} gross margin. Compare sales and profit together when deciding where to focus.</p>
      {categories.unmapped.lineCount > 0 && <p className="mt-3 text-xs leading-5 text-muted-foreground">{formatNumber(categories.unmapped.lineCount)} unmatched lines ({formatCurrency(categories.unmapped.revenue)}) remain in the totals and exception review, outside these category bars.</p>}
      <ChartLink href="/dashboard#category-performance-title">Compare categories</ChartLink>
    </article>
    <article className={cardClass} aria-labelledby="inventory-story-title">
      <p className="eyebrow">03 / Stock planning</p>
      <h3 id="inventory-story-title" className="text-xl font-semibold tracking-tight">Strong sellers need a stock check</h3>
      <p className="mt-5 text-3xl font-semibold tracking-tight text-[#985914]" data-testid="case-stock-coverage">{formatStockCoverage(products[0]?.coverage ?? null)}</p>
      <p className="mt-1 text-xs text-muted-foreground">{products[0]?.name ?? "Top seller"} · Estimated stock coverage</p>
      <figure className="mt-6">
        <ul className="divide-y divide-border">
          {products.map((product) => <li key={product.name} className="py-3 first:pt-0">
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-semibold">{product.name}</span><span className={`rounded-md px-2 py-1 text-xs font-semibold ${product.lowStock ? "bg-[#fff4e3] text-[#985914]" : "bg-secondary text-primary"}`}>{formatStockCoverage(product.coverage)}</span></div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{formatCompactCurrency(product.revenue)} sales · {formatNumber(product.inventory)} units in stock</p>
          </li>)}
        </ul>
        <figcaption className="mt-4 text-xs leading-5 text-muted-foreground">Top three styles by 2025 merchandise revenue, including their SKU variants.</figcaption>
      </figure>
      <p className="mt-5 text-sm leading-6 text-muted-foreground">Current stock divided by average monthly units sold in October–December 2025. Amber flags less than two months for review.</p>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">A shared inventory snapshot and recorded sales quantities, not a demand forecast. Refunds do not identify returned-unit counts.</p>
      <ChartLink href="/dashboard#product-inventory-title">Review product coverage</ChartLink>
    </article>
  </div>;
}
