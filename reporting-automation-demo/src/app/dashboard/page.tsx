import type { Metadata } from "next";
import { ChartNoAxesCombined } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeading } from "@/components/page-heading";
import { StageNavigation } from "@/components/stage-navigation";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <>
      <PageHeading step="03 / Dashboard" title="A clearer view of the business."
        description="The final stage will bring consistent management reporting together, connecting sales performance, product economics, inventory, and customer purchasing patterns." />
      <Card className="stage-placeholder">
        <span className="icon-tile mb-5"><ChartNoAxesCombined size={25} aria-hidden="true" /></span>
        <p className="status-label">Planned reporting</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">Insights will take shape here.</h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">KPI cards, charts, and filters are planned for a later step. This page contains no calculated metrics or reporting results yet.</p>
        <ul className="mt-7 grid gap-3 text-sm sm:grid-cols-2">
          <li className="planned-item">Monthly sales trend</li>
          <li className="planned-item">Revenue & gross profit by category</li>
          <li className="planned-item">Top products & inventory coverage</li>
          <li className="planned-item">First vs repeat customer sales</li>
        </ul>
      </Card>
      <p className="mt-5 text-sm leading-6 text-muted-foreground">Reporting will distinguish order-level net sales (including tax and shipping) from merchandise sales. The expense sample will not be used to claim net profit.</p>
      <StageNavigation index={2} />
    </>
  );
}
