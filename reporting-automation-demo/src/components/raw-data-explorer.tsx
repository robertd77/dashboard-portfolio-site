"use client";

import { useRef, useState } from "react";
import { Download, Eye, FileSpreadsheet, Package, Receipt, Users, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatasetPreview } from "@/components/dataset-preview";
import type { DatasetPreview as Preview, RawDatasetId } from "@/lib/datasets";
import { cn } from "@/lib/utils";

const icons = { orders: ShoppingBag, products: Package, customers: Users, expenses: Receipt };

export function RawDataExplorer({ datasets }: { datasets: Preview[] }) {
  const [selectedId, setSelectedId] = useState<RawDatasetId>("orders");
  const previewHeading = useRef<HTMLHeadingElement>(null);
  const selected = datasets.find((dataset) => dataset.id === selectedId);

  function selectDataset(id: RawDatasetId) {
    setSelectedId(id);
    requestAnimationFrame(() => previewHeading.current?.focus());
  }

  return (
    <>
      <section aria-labelledby="source-files-heading">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 id="source-files-heading" className="text-lg font-semibold">Source exports</h2>
          <span className="text-sm text-muted-foreground">2025 sample data · 4 CSV files</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {datasets.map((dataset) => {
            const Icon = icons[dataset.id];
            const active = selectedId === dataset.id;

            return (
              <Card key={dataset.id} className={cn("flex flex-col", active && "border-primary ring-1 ring-primary/20")}>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className="icon-tile"><Icon aria-hidden="true" size={21} strokeWidth={1.6} /></span>
                  <span className="text-xs text-muted-foreground">{dataset.source}</span>
                </div>
                <h3 className="text-lg font-semibold">{dataset.name}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{dataset.description}</p>
                <div className="mt-auto pt-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
                    <span className="flex min-w-0 items-center gap-2">
                      <FileSpreadsheet size={15} className="shrink-0" aria-hidden="true" />
                      <code className="break-all">{dataset.filename}</code>
                    </span>
                    <span className="font-semibold text-foreground">{dataset.rowCount.toLocaleString("en-CA")} rows</span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <Button
                      variant={active ? "default" : "outline"}
                      aria-label={`Preview ${dataset.name}`}
                      aria-pressed={active}
                      aria-controls="dataset-preview"
                      onClick={() => selectDataset(dataset.id)}
                    >
                      <Eye aria-hidden="true" />{active ? "Viewing preview" : "Preview records"}
                    </Button>
                    <a
                      href={`/raw-data/${dataset.id}/download`}
                      download={dataset.filename}
                      aria-label={`Download ${dataset.filename}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded text-xs font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      <Download size={14} aria-hidden="true" />Download CSV
                    </a>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
      {selected && <DatasetPreview dataset={selected} headingRef={previewHeading} />}
    </>
  );
}
