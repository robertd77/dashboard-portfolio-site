"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { calculateDashboardKpis, DEFAULT_DASHBOARD_FILTERS, filterDashboardData, updateMonthRange } from "@/lib/dashboard/selectors";
import type { DashboardData, DashboardFilters, DashboardKpis } from "@/lib/dashboard/types";

type DashboardContextValue = {
  data: DashboardData;
  filteredData: DashboardData;
  filters: DashboardFilters;
  kpis: DashboardKpis;
  setMonth: (boundary: "startMonth" | "endMonth", month: string) => void;
  setChannel: (channel: DashboardFilters["channel"]) => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ data, children }: { data: DashboardData; children: React.ReactNode }) {
  const [filters, setFilters] = useState<DashboardFilters>({ ...DEFAULT_DASHBOARD_FILTERS });
  const filteredData = useMemo(() => filterDashboardData(data, filters), [data, filters]);
  const kpis = useMemo(() => calculateDashboardKpis(filteredData), [filteredData]);

  return (
    <DashboardContext.Provider value={{
      data, filteredData, filters, kpis,
      setMonth: (boundary, month) => setFilters((current) => updateMonthRange(current, boundary, month)),
      setChannel: (channel) => setFilters((current) => ({ ...current, channel })),
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

/** Task 5 charts can consume these same filters, filtered records, and metric selectors. */
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("Dashboard components require DashboardProvider.");
  return context;
}
