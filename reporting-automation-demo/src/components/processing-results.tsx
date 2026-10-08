import Link from "next/link";
import { ArrowRight, CheckCircle2, Download, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { WorkflowView } from "@/lib/processing/types";

const count = (value: number) => value.toLocaleString("en-CA");
const currency = (value: number) => value.toLocaleString("en-CA", { style: "currency", currency: "CAD" });

export function ProcessingResults({ result }: { result: WorkflowView }) {
  const { summary, reconciliation, exceptions } = result;
  const ready = reconciliation.passed;

  return (
    <div className="mt-6 space-y-6">
      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="mb-4 text-lg font-semibold">What the workflow did</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: summary.orders, label: "Orders prepared", note: "One record per order" },
            { value: summary.orderLines, label: "Order lines retained", note: "Product-level detail preserved" },
            { value: summary.normalizedSkus, label: "SKU formats normalized", note: "Known formatting variants matched" },
            { value: exceptions.length, label: "Exceptions for review", note: "Retained, never silently discarded" },
          ].map((item) => (
            <Card key={item.label}>
              <p className="text-3xl font-semibold tracking-tight">{count(item.value)}</p>
              <h3 className="mt-3 text-sm font-semibold">{item.label}</h3>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.note}</p>
            </Card>
          ))}
        </div>
        <Card className="mt-4">
          <h3 className="font-semibold">Consistent rules applied across the exports</h3>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
            <li>{count(summary.voidedOrders)} voided orders assigned zero net sales.</li>
            <li>{count(summary.refundedOrders)} orders had recorded refunds applied.</li>
            <li>{count(summary.vendorAliases)} vendor aliases and {count(summary.categoryAliases)} expense category aliases standardized.</li>
            <li>{count(summary.guestOrders)} guest / unidentified orders retained without email matching.</li>
          </ul>
        </Card>
      </section>

      <section aria-labelledby="exceptions-heading" className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="p-6">
          <h2 id="exceptions-heading" className="flex items-center gap-2 text-lg font-semibold">
            <TriangleAlert size={20} aria-hidden="true" className="text-primary" />Exceptions for review
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{count(summary.missingSkus)} lines have no SKU; {count(summary.unmatchedSkus)} have an unmatched SKU. They remain in the reporting data, with product attributes and unit costs left unknown. Refunds, cancellations, and guest orders are ordinary transactions, not data-quality errors.</p>
        </div>
        {exceptions.length > 0 ? (
          <div role="region" aria-label="Unresolved product matches" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
            <table className="w-full text-left text-xs">
              <caption className="sr-only">Unresolved source records retained for review</caption>
              <thead className="bg-secondary text-foreground">
                <tr>{["Source", "Order ID", "Line item", "Issue", "Recommended action"].map((header) => <th key={header} scope="col" className="whitespace-nowrap px-6 py-3 font-semibold">{header}</th>)}</tr>
              </thead>
              <tbody>
                {exceptions.map((row, index) => (
                  <tr key={index} className="border-t border-border">
                    <td className="whitespace-nowrap px-6 py-4 font-mono">{row.source}</td>
                    <td className="whitespace-nowrap px-6 py-4 font-mono">{row.order_id}</td>
                    <td className="whitespace-nowrap px-6 py-4">{row.lineitem_name}</td>
                    <td className="whitespace-nowrap px-6 py-4">{row.sku_match_status}</td>
                    <td className="min-w-64 px-6 py-4 leading-5">{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="px-6 pb-6 text-sm text-muted-foreground">No unresolved product matches were found.</p>}
      </section>

      <section aria-labelledby="reconciliation-heading">
        <Card>
          <h2 id="reconciliation-heading" className="flex items-center gap-2 text-lg font-semibold">
            {ready ? <CheckCircle2 size={20} aria-hidden="true" className="text-primary" /> : <TriangleAlert size={20} aria-hidden="true" />}
            {ready ? "Reference reconciliation passed" : "Reference differences need review"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">The workflow generated new datasets from the raw files, then compared their columns, record counts, values, and totals against the supplied references.</p>
          <p className="mt-3 text-sm font-semibold">Order-level net sales: {currency(summary.netSales)} CAD <span className="font-normal text-muted-foreground">(includes tax and shipping)</span></p>
          <div role="region" aria-label="Reconciliation checks" tabIndex={0} className="mt-5 overflow-x-auto rounded-lg border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            <table className="w-full text-left text-xs">
              <caption className="sr-only">Generated reporting dataset counts and reference comparison results</caption>
              <thead className="bg-secondary"><tr>{["Dataset", "Generated rows", "Reference rows", "Comparison"].map((header) => <th key={header} scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">{header}</th>)}</tr></thead>
              <tbody>{reconciliation.checks.map((check) => (
                <tr key={check.filename} className="border-t border-border">
                  <td className="whitespace-nowrap px-4 py-3 font-mono">{check.filename}</td>
                  <td className="px-4 py-3">{count(check.generatedRows)}</td>
                  <td className="px-4 py-3">{count(check.referenceRows)}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold">{check.passed ? "Matched" : `${count(check.mismatchedCells)} differences`}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {!ready && <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">{reconciliation.checks.filter((check) => !check.passed).map((check) => <li key={check.filename}>{check.filename}: {check.examples.join(" ")}</li>)}</ul>}
          <p className="mt-4 text-xs leading-6 text-muted-foreground">Figures are rounded for display. Original and reference files remain unchanged, and unresolved source records stay available for review.</p>
        </Card>
      </section>

      <aside className="scope-note" aria-label="Reporting conventions">
        <TriangleAlert size={20} className="shrink-0 text-primary" aria-hidden="true" />
        <div>
          <h2 className="text-sm font-semibold">Keep the reporting context visible</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">The reference convention subtracts recorded line refunds as supplied, which can produce negative merchandise sales when refunds include tax or shipping. Unmatched lines use zero COGS for reconciliation, but their costs are unknown and their profit is unverified. The expense sample is not a complete ledger.</p>
        </div>
      </aside>

      {ready && (
        <section aria-labelledby="outputs-heading">
          <h2 id="outputs-heading" className="mb-4 text-lg font-semibold">{summary.datasetsGenerated} reporting datasets generated</h2>
          <div className="grid gap-3 sm:grid-cols-2">{result.datasets.map((dataset) => (
            <a key={dataset.id} href={`/process/${dataset.id}/download`} download={dataset.filename} className="flex min-w-0 items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 hover:bg-secondary" aria-label={`Download ${dataset.filename}`}>
              <span className="min-w-0"><span className="block text-sm font-semibold">{dataset.name}</span><span className="mt-1 block break-all font-mono text-xs text-muted-foreground">{dataset.filename} · {count(dataset.rowCount)} rows</span></span>
              <Download size={18} aria-hidden="true" className="shrink-0 text-primary" />
            </a>
          ))}</div>
          <p className="mt-3 text-xs leading-6 text-muted-foreground">Download any of the generated CSVs to inspect the reporting-ready records, including retained exceptions.</p>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">Raw exports → automated cleanup → validated reporting data</p>
            <Button asChild><Link href="/dashboard">Continue to Dashboard<ArrowRight aria-hidden="true" /></Link></Button>
          </div>
        </section>
      )}
    </div>
  );
}
