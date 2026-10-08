"use client";

import type { ComponentProps, ReactNode } from "react";
import { useSyncExternalStore } from "react";
import { ChartTooltipContent } from "@/components/ui/chart";

const touchQuery = "(hover: none) and (pointer: coarse)";
function subscribeToPointer(callback: () => void) {
  const media = window.matchMedia(touchQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

/** Native clicks make tap-to-inspect reliable without interfering with page scrolling. */
export function useChartTooltipTrigger() {
  const touch = useSyncExternalStore(subscribeToPointer, () => window.matchMedia(touchQuery).matches, () => false);
  return touch ? "click" as const : "hover" as const;
}

export function TooltipMetric({ label, value, emphasized = false }: { label: string; value: ReactNode; emphasized?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={emphasized ? "text-base font-semibold text-primary tabular-nums" : "font-medium text-foreground tabular-nums"}>{value}</dd>
    </div>
  );
}

/** Retain shadcn's chart context and tooltip behavior with a consistent reporting surface. */
export function ReportingChartTooltip({ heading, children, payload, ...props }: ComponentProps<typeof ChartTooltipContent> & { heading: string; children: ReactNode }) {
  return (
    <ChartTooltipContent {...props} payload={payload?.slice(0, 1)}
      className="min-w-56 rounded-xl border-border bg-card p-4 text-xs shadow-[0_8px_30px_-8px_#23352e33]"
      labelFormatter={() => <span className="text-sm font-semibold">{heading}</span>}
      hideIndicator
      formatter={() => <dl className="mt-2 grid w-full gap-2.5">{children}</dl>}
    />
  );
}
