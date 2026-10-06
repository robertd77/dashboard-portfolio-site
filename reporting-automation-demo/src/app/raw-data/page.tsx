import type { Metadata } from "next";
import { FileSpreadsheet, Package, Receipt, Users, ShoppingBag, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeading } from "@/components/page-heading";
import { StageNavigation } from "@/components/stage-navigation";

export const metadata: Metadata = { title: "Raw Data" };

const exports = [
  { name: "Orders", file: "orders.csv", source: "Shopify-style export", icon: ShoppingBag,
    description: "Order and line-item records from online and point-of-sale purchases, including refunds and cancellations." },
  { name: "Products & inventory", file: "products_inventory.csv", source: "Shopify-style export", icon: Package,
    description: "The product master: SKUs, categories, unit costs, retail prices, and current inventory." },
  { name: "Customers", file: "customers.csv", source: "Shopify-style export", icon: Users,
    description: "Customer records for identified shoppers. Guest orders remain part of the reporting workflow." },
  { name: "Expenses", file: "expenses.csv", source: "Accounting-style export", icon: Receipt,
    description: "An operational expense sample with vendor and category details. This is not a complete accounting ledger." },
];

export default function RawDataPage() {
  return (
    <>
      <PageHeading step="01 / Raw Data" title="Every report starts with the source."
        description="Meet the four simulated exports behind Northwood’s reporting workflow. The goal: less recurring spreadsheet work, consistent reporting, and visible exceptions." />
      <section aria-labelledby="source-files-heading">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 id="source-files-heading" className="text-lg font-semibold">Source exports</h2>
          <span className="text-sm text-muted-foreground">2025 sample data · 4 CSV files</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {exports.map(({ name, file, source, icon: Icon, description }) => (
            <Card key={file}>
              <div className="mb-5 flex items-center justify-between gap-3">
                <span className="icon-tile"><Icon aria-hidden="true" size={21} strokeWidth={1.6} /></span>
                <span className="text-xs text-muted-foreground">{source}</span>
              </div>
              <h3 className="text-lg font-semibold">{name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
                <FileSpreadsheet size={15} aria-hidden="true" />
                <code className="break-all">{file}</code>
              </div>
            </Card>
          ))}
        </div>
      </section>
      <aside className="scope-note mt-6" aria-label="Current demo scope">
        <ArrowUpRight size={20} className="shrink-0 text-primary" aria-hidden="true" />
        <div><h2 className="text-sm font-semibold">The workflow starts here</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">This initial version introduces the source files and reporting stages. Table previews, processing, and dashboard reporting will be added in later steps.</p>
        </div>
      </aside>
      <StageNavigation index={0} />
    </>
  );
}
