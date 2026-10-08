"use client";

import { Card } from "@/components/ui/card";
import { SlidersHorizontal } from "lucide-react";
import { useDashboard } from "./dashboard-provider";
import { DASHBOARD_MONTHS } from "@/lib/dashboard/selectors";
import { formatMonth, formatShortMonth } from "@/lib/dashboard/format";
import type { DashboardFilters as Filters } from "@/lib/dashboard/types";

const controlClass = "mt-1.5 min-h-11 w-full cursor-pointer rounded-lg border border-border bg-white px-2 py-2 text-xs font-medium text-foreground shadow-sm transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:px-3 sm:text-sm";

export function DashboardFilters() {
  const { filters, setMonth, setChannel } = useDashboard();
  return (
    <Card data-testid="dashboard-filter-bar" className="sticky top-3 z-30 border-primary/15 bg-card/95 p-3 shadow-[0_6px_24px_-10px_#23352e40] backdrop-blur-md sm:p-4">
      <div className="flex items-center gap-5">
        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <span className="grid size-9 place-items-center rounded-lg bg-secondary text-primary"><SlidersHorizontal size={17} aria-hidden="true" /></span>
          <div><h2 className="text-sm font-semibold">Reporting filters</h2><p className="mt-1 text-xs text-muted-foreground">2025 reporting · CAD</p></div>
        </div>
        <fieldset className="grid min-w-0 flex-1 grid-cols-3 gap-2 sm:gap-4">
          <legend className="sr-only">Dashboard filters: inclusive month range and sales channel</legend>
            {(["startMonth", "endMonth"] as const).map((boundary) => (
              <div key={boundary} className="min-w-0 text-xs text-muted-foreground">
                <label htmlFor={`dashboard-${boundary}`}>{boundary === "startMonth" ? "From month" : "To month"}</label>
                <select id={`dashboard-${boundary}`} aria-describedby="dashboard-range-help" value={filters[boundary]} onChange={(event) => setMonth(boundary, event.target.value)} className={controlClass}>
                  {DASHBOARD_MONTHS.map((month) => <option key={month} value={month} title={formatMonth(month)}>{formatShortMonth(month)} ’{month.slice(2, 4)}</option>)}
                </select>
              </div>
            ))}
          <div className="min-w-0 text-xs text-muted-foreground">
            <label htmlFor="dashboard-channel">Sales channel</label>
            <select id="dashboard-channel" value={filters.channel} onChange={(event) => setChannel(event.target.value as Filters["channel"])} className={controlClass}>
              <option value="All">All</option><option value="Online">Online</option><option value="POS">POS</option>
            </select>
          </div>
        </fieldset>
      </div>
      <p id="dashboard-range-help" className="sr-only">Reporting year 2025. Both selected months are included. Moving a boundary past the other adjusts the range to that month. All currency figures are CAD.</p>
    </Card>
  );
}
