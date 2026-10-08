import type { Metadata } from "next";
import { PageHeading } from "@/components/page-heading";
import { StageNavigation } from "@/components/stage-navigation";
import { DashboardProvider } from "@/components/dashboard/dashboard-provider";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { MonthlySalesChart } from "@/components/dashboard/charts/monthly-sales-chart";
import { CategoryPerformanceChart } from "@/components/dashboard/charts/category-performance-chart";
import { ProductInventoryChart } from "@/components/dashboard/charts/product-inventory-chart";
import { CustomerPurchaseMixChart } from "@/components/dashboard/charts/customer-purchase-mix-chart";
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
          <p className="mt-2 text-sm text-muted-foreground">Explore sales, product economics, stock coverage, and customer purchasing in the selected reporting view.</p>
          <MonthlySalesChart />
          <div className="mt-5 grid gap-5"><CategoryPerformanceChart /><ProductInventoryChart /><CustomerPurchaseMixChart /></div>
        </section>
      </DashboardProvider>
      <StageNavigation index={2} />
    </>
  );
}
