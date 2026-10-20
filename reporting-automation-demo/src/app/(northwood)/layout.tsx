import type { Metadata } from "next";
import Link from "next/link";
import { Trees } from "lucide-react";
import { SiteNavigation } from "@/components/site-navigation";
import { WorkflowNav } from "@/components/workflow-nav";

export const metadata: Metadata = {
  title: { default: "Northwood | Clearflow Reporting Demo", template: "%s | Northwood Demo | Clearflow Reporting" },
  description: "Reporting automation for Northwood Supply Co. Explore source data, validation, and management reporting.",
};

export default function NorthwoodLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <header className="site-header">
        <div className="shell-container flex items-center justify-between gap-3 py-4 sm:py-6">
          <Link href="/raw-data" className="brand" aria-label="Northwood demo — Raw Data">
            <span className="brand-mark"><Trees size={26} strokeWidth={1.5} aria-hidden="true" /></span>
            <span>
              <span className="block text-base font-bold tracking-tight sm:text-lg">Northwood Supply Co.</span>
              <span className="block text-xs text-muted-foreground">Reporting workflow</span>
            </span>
          </Link>
          <SiteNavigation variant="northwood" />
        </div>
      </header>
      <div className="shell-container">
        <WorkflowNav />
        <main id="main-content" tabIndex={-1} className="pb-14 outline-none">{children}</main>
        <footer className="site-footer">
          <p>Northwood Supply Co. · A Clearflow Reporting demo</p>
          <p>Fictional retailer · Simulated data · Not a real client engagement</p>
        </footer>
      </div>
    </>
  );
}
