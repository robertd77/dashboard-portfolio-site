"use client";

import { Card } from "@/components/ui/card";
import { useDashboard } from "./dashboard-provider";
import { DASHBOARD_MONTHS } from "@/lib/dashboard/selectors";
import { formatMonth } from "@/lib/dashboard/format";
import type { DashboardFilters as Filters } from "@/lib/dashboard/types";

const controlClass = "mt-2 min-h-11 w-full cursor-pointer rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function DashboardFilters() {
  const { filters, setMonth, setChannel } = useDashboard();
  return (
    <Card>
      <h2 className="text-lg font-semibold">Choose your reporting view</h2>
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        <fieldset className="min-w-0 md:col-span-2">
          <legend className="text-sm font-semibold">Date range</legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {(["startMonth", "endMonth"] as const).map((boundary) => (
              <div key={boundary} className="text-xs text-muted-foreground">
                <label htmlFor={`dashboard-${boundary}`}>{boundary === "startMonth" ? "From month" : "To month"}</label>
                <select id={`dashboard-${boundary}`} value={filters[boundary]} onChange={(event) => setMonth(boundary, event.target.value)} className={controlClass}>
                  {DASHBOARD_MONTHS.map((month) => <option key={month} value={month}>{formatMonth(month)}</option>)}
                </select>
              </div>
            ))}
          </div>
        </fieldset>
        <div className="block text-sm font-semibold md:pt-6">
          <label htmlFor="dashboard-channel">Sales channel</label>
          <select id="dashboard-channel" value={filters.channel} onChange={(event) => setChannel(event.target.value as Filters["channel"])} className={controlClass}>
            <option value="All">All channels</option><option value="Online">Online</option><option value="POS">POS</option>
          </select>
        </div>
      </div>
      <p className="mt-4 text-xs leading-6 text-muted-foreground">Both selected months are included. Moving a boundary past the other adjusts the range to that month. All currency figures are CAD.</p>
    </Card>
  );
}
