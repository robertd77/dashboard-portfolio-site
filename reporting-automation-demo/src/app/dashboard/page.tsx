import type { Metadata } from "next";
import { ChartNoAxesCombined, ChartColumnBig, Package, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeading } from "@/components/page-heading";
import { StageNavigation } from "@/components/stage-navigation";
import { DashboardProvider } from "@/components/dashboard/dashboard-provider";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { runReportingWorkflow } from "@/lib/processing/workflow";
import { dashboardDataFromWorkflow } from "@/lib/dashboard/data";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const data = dashboardDataFromWorkflow(await runReportingWorkflow());
  return (
    <>
      <PageHeading step="03 / Dashboard" title="A clearer view of the business."
        description="Explore the reporting-ready figures for Northwood Supply Co., a fictional retailer. Choose a month range and sales channel to see a consistent view of its simulated sales and merchandise performance." />
      <DashboardProvider data={data}>
        <DashboardFilters />
        <KpiCards />
        <section aria-labelledby="reporting-views-heading" className="mt-8">
          <h2 id="reporting-views-heading" className="text-lg font-semibold">Reporting views</h2>
          <p className="mt-2 text-sm text-muted-foreground">Four charts will build on this reporting view in the next stage of the demo.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              { name: "Monthly sales trend", icon: ChartNoAxesCombined },
              { name: "Revenue & gross profit by category", icon: ChartColumnBig },
              { name: "Top products & inventory coverage", icon: Package },
              { name: "First vs repeat customer sales", icon: Users },
            ].map(({ name, icon: Icon }) => (
              <Card key={name} className="min-h-40 border-dashed shadow-none">
                <div className="flex items-center justify-between gap-3"><span className="icon-tile"><Icon size={21} aria-hidden="true" /></span><span className="text-xs text-muted-foreground">Planned chart</span></div>
                <h3 className="mt-4 text-sm font-semibold">{name}</h3>
              </Card>
            ))}
          </div>
        </section>
      </DashboardProvider>
      <StageNavigation index={2} />
    </>
  );
}
