import type { Ref } from "react";
import { Download, MoveHorizontal } from "lucide-react";
import type { DatasetPreview as Preview } from "@/lib/datasets";
import { Button } from "@/components/ui/button";

export function DatasetPreview({ dataset, headingRef }: {
  dataset: Preview;
  headingRef: Ref<HTMLHeadingElement>;
}) {
  return (
    <section id="dataset-preview" aria-labelledby="preview-heading" className="mt-8 min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="min-w-0">
          <p className="eyebrow mb-2">Source preview · Simulated data</p>
          <h2 id="preview-heading" ref={headingRef} tabIndex={-1} className="text-lg font-semibold focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            {dataset.name} preview
          </h2>
          <p className="mt-2 break-all font-mono text-xs text-muted-foreground">{dataset.filename}</p>
        </div>
        <Button asChild variant="outline">
          <a href={`/raw-data/${dataset.id}/download`} download={dataset.filename}>
            <Download aria-hidden="true" />Download CSV
          </a>
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-border bg-secondary px-6 py-3 text-xs text-muted-foreground">
        <p>Showing the first {dataset.rows.length} of {dataset.rowCount.toLocaleString("en-CA")} rows</p>
        <p className="flex items-center gap-2"><MoveHorizontal size={15} aria-hidden="true" />Scroll across to explore all columns</p>
      </div>
      <div
        role="region"
        aria-label={`${dataset.name} source records`}
        aria-describedby="preview-note"
        tabIndex={0}
        className="max-h-96 overflow-auto overscroll-x-contain focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      >
        <table className="w-full border-separate border-spacing-0 text-left text-xs">
          <caption className="sr-only">First {dataset.rows.length} records from {dataset.filename}, with original source column names and values.</caption>
          <thead>
            <tr>
              {dataset.headers.map((header, index) => (
                <th key={index} scope="col" className="sticky top-0 z-10 whitespace-pre border-b border-border bg-secondary px-4 py-3 font-semibold text-foreground">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataset.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="even:bg-background/60 hover:bg-secondary/60">
                {row.map((value, columnIndex) => (
                  <td key={columnIndex} className="whitespace-pre border-b border-border px-4 py-3 font-mono text-foreground" aria-label={value === "" ? "Empty cell" : undefined}>
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p id="preview-note" className="px-6 py-4 text-xs leading-6 text-muted-foreground">
        Original column names and values are shown as supplied. Blank cells and inconsistent entries are left unchanged; cleanup belongs to the next stage.
      </p>
    </section>
  );
}
