import type { Metadata } from "next";
import { Mail } from "lucide-react";
import landingStyles from "@/components/landing/landing.module.css";
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
        description="Explore the reporting-ready figures for Northwood Supply Co. Choose a month range and sales channel to see a consistent view of its sales and merchandise performance." />
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
      <section id="contact" aria-labelledby="dashboard-contact-title" className={`${landingStyles.landing} ${landingStyles.dark} ${landingStyles.contact} mt-10 overflow-hidden rounded-2xl`}>
        <div className={`${landingStyles.contactInner} px-6 sm:px-10`}>
          <div>
            <p className={landingStyles.kicker}>Let&apos;s simplify the next reporting cycle</p>
            <h2 id="dashboard-contact-title" className={landingStyles.sectionHeading}>Make reporting <span className={landingStyles.contactEmphasis}>work for you.</span></h2>
            <p>Tell me what you export, what you do with it, and which report you need at the end. Then we&apos;ll get started.</p>
          </div>
          <div className="min-w-0">
            <a href="mailto:clearflowreporting@gmail.com" className={landingStyles.email}>clearflowreporting@gmail.com<Mail size={22} strokeWidth={1.5} aria-hidden="true" /></a>
            <p className={landingStyles.contactTagline}>Less manual work. Clearer reporting.</p>
          </div>
        </div>
      </section>
      <StageNavigation index={2} />
    </>
  );
}
