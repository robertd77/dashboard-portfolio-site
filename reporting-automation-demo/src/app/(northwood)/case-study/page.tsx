import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, ClipboardCheck, FileSpreadsheet, FolderInput, Layers, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InsightPreviews } from "@/components/case-study/insight-previews";
import { selectCaseStudyInsights } from "@/lib/case-study/insights";
import { dashboardDataFromWorkflow } from "@/lib/dashboard/data";
import { formatCompactCurrency, formatNumber } from "@/lib/dashboard/format";
import { rawDatasets } from "@/lib/datasets";
import { runReportingWorkflow } from "@/lib/processing/workflow";
import { workflowSteps } from "@/lib/workflow";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Reporting Automation Case Study",
  description: "See how four business exports become a repeatable reporting workflow with automated cleanup, validation, and an interactive dashboard.",
  alternates: { canonical: "/case-study" },
  openGraph: { title: "Reporting Automation Case Study | Clearflow Reporting", description: "Explore how four exports become a validated, repeatable reporting workflow using a fictional Ontario retailer.", url: "/case-study" },
  twitter: { title: "Reporting Automation Case Study | Clearflow Reporting" },
};

const sectionClass = "border-t border-border py-12 sm:py-16";
const headingClass = "max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl";

export default async function CaseStudyPage() {
  const result = await runReportingWorkflow();
  const insights = selectCaseStudyInsights(dashboardDataFromWorkflow(result));
  const stages = [
    { icon: FolderInput, title: "Raw exports", detail: "Inspect the orders, products, customers, and expenses exactly as they arrive." },
    { icon: ShieldCheck, title: "Processing & validation", detail: "Check the files, standardize obvious differences, apply the reporting rules, and surface exceptions for review." },
    { icon: Layers, title: "Reporting dashboard", detail: "Explore consistent sales, category, inventory, and customer measures from the prepared records." },
  ];
  return <article aria-labelledby="case-study-title">
    <section className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.6fr_1fr] lg:gap-14" aria-labelledby="case-study-title">
      <div>
        <p className="eyebrow">Northwood / Reporting automation case study</p>
        <h1 id="case-study-title" className={styles.heroTitle}>From scattered exports to a clearer view of the business.</h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">Meet Northwood Supply Co., an Ontario apparel retailer selling online and in store. See how a recurring spreadsheet routine becomes a guided, repeatable reporting workflow.</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button asChild><Link href="/raw-data">Explore Interactive Demo<ArrowRight aria-hidden="true" /></Link></Button>
          <Link href="#solution" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline">See the workflow<ArrowUpRight className="size-4" aria-hidden="true" /></Link>
        </div>
        
      </div>
      <aside className="relative overflow-hidden rounded-2xl border border-primary bg-primary p-7 text-white shadow-lg sm:p-8" aria-labelledby="snapshot-title">
        <div className="absolute -right-16 -top-16 size-56 rounded-full border border-white/10" aria-hidden="true" />
        <div className="absolute -right-8 -top-8 size-40 rounded-full border border-white/10" aria-hidden="true" />
        <p id="snapshot-title" className="relative text-xs font-semibold uppercase tracking-[0.15em] text-white/80">A year of reporting, connected</p>
        <dl className="relative mt-8">
          <div><dt className="text-sm text-white/80">2025 net sales</dt><dd className="mt-2 text-5xl font-semibold tracking-tight" data-testid="case-annual-sales">{formatCompactCurrency(insights.kpis.netSales, 2)}</dd></div>
          <div className="mt-7 grid grid-cols-2 gap-5 border-t border-white/20 pt-6">
            <div><dt className="text-xs text-white/80">Distinct orders</dt><dd className="mt-2 text-2xl font-semibold" data-testid="case-orders">{formatNumber(insights.kpis.orders)}</dd></div>
            <div><dt className="text-xs text-white/80">Order lines</dt><dd className="mt-2 text-2xl font-semibold">{formatNumber(insights.lineCount)}</dd></div>
          </div>
        </dl>
        <p className="relative mt-7 flex items-start gap-2 border-t border-white/20 pt-5 text-xs leading-5 text-white/80"><Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />Prepared from {rawDatasets.length} source exports. Net sales include tax and shipping.</p>
      </aside>
    </section>

    <section className={sectionClass} aria-labelledby="problem-title">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <div>
          <p className="eyebrow">The problem</p>
          <h2 id="problem-title" className={headingClass}>Every report starts with the <span className="heading-highlight">same spreadsheet work.</span></h2>
          <p className="mt-5 text-base leading-7 text-muted-foreground">Operations staff pull Shopify and accounting exports, update workbooks, and rebuild the monthly view. The work is familiar, but it repeats every reporting cycle.</p>
          <p className="mt-4 text-base leading-7 text-muted-foreground">A differently formatted SKU can break a lookup. A refund can change a total. A formula copied inconsistently can leave two reports telling different stories.</p>
        </div>
        <ol className="overflow-hidden rounded-2xl border border-border bg-card">
          {[
            { title: "Gather the exports", description: "Download Shopify orders, products and stock, customer records, and accounting expenses." },
            { title: "Repair the reporting workbook", description: "Paste fresh records, tidy SKU formats, match product costs, and standardize expense names and categories." },
            { title: "Recalculate and review", description: "Account for refunds and cancellations, refresh sales and margin formulas, update pivots and charts, then prepare management reporting." },
          ].map((step, index) => <li key={step.title} className="flex gap-4 border-b border-border p-6 last:border-b-0"><span className="mt-0.5 text-xs font-semibold text-primary" aria-hidden="true">0{index + 1}</span><div><h3 className="font-semibold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p></div></li>)}
        </ol>
      </div>
      <div className="mt-10 rounded-2xl border border-border bg-secondary/50 p-5 sm:p-6">
        <h3 className="text-sm font-semibold">Four ordinary inputs. One recurring reporting task.</h3>
        <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {rawDatasets.map((dataset) => <li key={dataset.id}><FileSpreadsheet className="mb-3 size-5 text-primary" aria-hidden="true" /><p className="text-sm font-semibold">{dataset.name}</p><p className="mt-1 break-all text-xs text-muted-foreground">{dataset.filename}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{dataset.source}</p></li>)}
        </ul>
        <p className="mt-5 text-xs leading-5 text-muted-foreground">The expense file is an operational sample, not a complete accounting ledger. It supports cleanup demonstrations, not a net-profit claim.</p>
      </div>
    </section>

    <section id="solution" className={`${sectionClass} scroll-mt-6`} aria-labelledby="solution-title">
      <p className="eyebrow">The solution</p>
      <h2 id="solution-title" className={headingClass}>Make the process <span className="heading-highlight">repeatable.</span> Keep the review visible.</h2>
      <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">The exports become the starting point for a defined workflow: validate, normalize, apply consistent calculations, review exceptions, and report. The dashboard is the useful end result of that process.</p>
      <ol className="mt-8 grid gap-5 md:grid-cols-3">
        {stages.map((stage, index) => <li key={stage.title} className="relative flex flex-col rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between"><span className="icon-tile"><stage.icon aria-hidden="true" size={22} /></span><span className="text-xs font-semibold text-muted-foreground" aria-hidden="true">0{index + 1}{index < 2 && <ArrowRight className="ml-3 inline size-4" />}</span></div>
          <h3 className="mt-6 text-lg font-semibold">{stage.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{stage.detail}</p>
          <Link href={workflowSteps[index].href} className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-primary hover:underline">{workflowSteps[index].label}<ArrowUpRight className="size-4" aria-hidden="true" /></Link>
        </li>)}
      </ol>
      <div className="warning-panel mt-6 flex items-start gap-4 rounded-xl p-5 sm:p-6"><ClipboardCheck className="mt-1 size-5 shrink-0 text-[#9a640f]" aria-hidden="true" /><div><h3 className="text-sm font-semibold">Automation still leaves room for judgment.</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">The demo flags {formatNumber(result.summary.missingSkus)} lines with missing SKUs for review, rather than guessing a product match. Guest orders stay visible, and refund and cancellation rules stay consistent.</p></div></div>
    </section>

    <section className={sectionClass} aria-labelledby="insights-title">
      <p className="eyebrow">Example insights</p>
      <h2 id="insights-title" className={headingClass}>Less time assembling the report. More room to ask <span className="heading-highlight">useful questions.</span></h2>
      <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">These findings come from the same prepared data as the interactive dashboard. Full-year 2025, all sales channels, with amounts in Canadian dollars.</p>
      <InsightPreviews insights={insights} />
    </section>

    <section className={sectionClass} aria-labelledby="value-title">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div><p className="eyebrow">Business value</p><h2 id="value-title" className={headingClass}>A reporting routine the team can repeat.</h2><p className="mt-5 text-base leading-7 text-muted-foreground">The value is in replacing recurring preparation work with a consistent process, while keeping the numbers and unresolved issues open to review.</p></div>
        <div className="grid gap-6 sm:grid-cols-2">
          {[
            { icon: RefreshCw, title: "Repeatable reporting", text: "Follow the same preparation and review steps each cycle, rather than rebuilding the workbook." },
            { icon: Layers, title: "Consistent calculations", text: "Keep one definition of net sales, refunds, and margins across the reporting views." },
            { icon: ShieldCheck, title: "Visible exceptions", text: "See records that need attention before treating the report as settled." },
            { icon: Sparkles, title: "Less manual preparation", text: "Reduce repeated cleanup, product lookups, and formula updates so staff can focus on reviewing the business." },
          ].map((value) => <div key={value.title} className="rounded-xl border border-border bg-card p-5"><value.icon className="size-5 text-primary" aria-hidden="true" /><h3 className="mt-4 text-base font-semibold">{value.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{value.text}</p></div>)}
        </div>
      </div>
    </section>

    <section className="rounded-2xl border border-border bg-secondary p-7 sm:p-10 lg:p-12" aria-labelledby="final-cta-title">
      <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
        <div className="max-w-xl"><p className="eyebrow">See the whole workflow</p><h2 id="final-cta-title" className={headingClass}>What could your next reporting cycle look like?</h2><p className="mt-5 text-base leading-7 text-muted-foreground">Start with the exports. Watch the preparation and validation. Explore the results. Use this example as a starting point for a conversation about automating your own reporting routine.</p></div>
        <div className="flex shrink-0 flex-col items-start gap-4"><Button asChild><Link href="/raw-data">Explore Interactive Demo<ArrowRight aria-hidden="true" /></Link></Button><Link href="/dashboard" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline">Go straight to the dashboard<ArrowUpRight className="size-4" aria-hidden="true" /></Link></div>
      </div>
    </section>
  </article>;
}
