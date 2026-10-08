import type { ReactNode } from "react";
import type { ChartConfig } from "@/components/ui/chart";

export function ReportingLegend({ config }: { config: ChartConfig }) {
  return <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">{Object.entries(config).map(([key, item]) => <span key={key} className="inline-flex items-center gap-2"><span className="size-2.5 rounded-sm" style={{ backgroundColor: item.color }} />{item.label}</span>)}</div>;
}

export function ReportingSummary({ label, value }: { label: string; value: ReactNode }) {
  return <div className="rounded-xl border border-[#138660]/15 bg-[#edf8f1] px-4 py-3 sm:text-right"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold tracking-tight text-primary tabular-nums">{value}</p></div>;
}

export function ReportingInsight({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-[#bd741d]/15 bg-[#fff7e9] px-4 py-3 text-sm leading-7 text-muted-foreground">{children}</p>;
}

export function ReportingEmpty({ message = "No records match this view." }: { message?: string }) {
  return <div className="mt-5 flex min-h-64 flex-col items-center justify-center rounded-lg bg-background px-5 text-center"><p className="font-semibold">{message}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Try another month range or sales channel.</p></div>;
}

/** Every chart retains an accessible, inspectable alternative to SVG and tooltips. */
export function ReportingFigures({ title, caption, columns, rows }: {
  title: string; caption: string; columns: string[]; rows: { key: string; cells: ReactNode[] }[];
}) {
  return <details className="mt-4 text-xs text-muted-foreground">
    <summary className="w-fit cursor-pointer rounded font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">{title}</summary>
    <div className="mt-3 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-right tabular-nums">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-background"><tr>{columns.map((column, i) => <th key={column} scope="col" className={`whitespace-nowrap px-3 py-3 ${i === 0 ? "text-left" : ""}`}>{column}</th>)}</tr></thead>
        <tbody>{rows.map((row) => <tr key={row.key} className="border-t border-border/60">{row.cells.map((cell, i) => i === 0 ? <th key={i} scope="row" className="whitespace-nowrap px-3 py-2.5 text-left font-medium">{cell}</th> : <td key={i} className="whitespace-nowrap px-3 py-2.5">{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  </details>;
}
