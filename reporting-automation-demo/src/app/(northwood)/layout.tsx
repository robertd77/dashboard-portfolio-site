import type { Metadata } from "next";
import Link from "next/link";
import { Trees } from "lucide-react";
import { WorkflowNav } from "@/components/workflow-nav";

export const metadata: Metadata = {
  title: { default: "Northwood | Reporting Automation Demo", template: "%s | Northwood Demo" },
  description: "Reporting automation for Northwood Supply Co. Explore source data, validation, and management reporting.",
};

export default function NorthwoodLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <header className="site-header">
        <div className="shell-container flex flex-wrap items-center justify-between gap-4 py-6">
          <Link href="/raw-data" className="brand" aria-label="Northwood demo — Raw Data">
            <span className="brand-mark"><Trees size={26} strokeWidth={1.5} aria-hidden="true" /></span>
            <span>
              <span className="block text-lg font-bold tracking-tight">Northwood Supply Co.</span>
              <span className="block text-xs text-muted-foreground">Reporting workflow</span>
            </span>
          </Link>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/" className="rounded-md py-2 text-sm font-semibold text-primary hover:underline">Home</Link>
            <Link href="/case-study" className="rounded-md py-2 text-sm font-semibold text-primary hover:underline">Case study</Link>

          </div>
        </div>
      </header>
      <div className="shell-container">
        <WorkflowNav />
        <main id="main-content" tabIndex={-1} className="pb-14 outline-none">{children}</main>
        <footer className="site-footer">
          <p>Northwood Supply Co. · Reporting automation</p>
          <p>Fictional retailer · Simulated data · Not a real client engagement</p>
        </footer>
      </div>
    </>
  );
}
