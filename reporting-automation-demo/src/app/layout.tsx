import type { Metadata } from "next";
import Link from "next/link";
import { Trees } from "lucide-react";
import { WorkflowNav } from "@/components/workflow-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Northwood | Reporting Automation Demo", template: "%s | Northwood Demo" },
  description: "A portfolio demo of reporting automation for Northwood Supply Co., a fictional Ontario apparel retailer. All included data is simulated.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <header className="site-header">
          <div className="shell-container flex flex-wrap items-center justify-between gap-4 py-6">
            <Link href="/raw-data" className="brand" aria-label="Northwood demo — Raw Data">
              <span className="brand-mark"><Trees size={26} strokeWidth={1.5} aria-hidden="true" /></span>
              <span>
                <span className="block text-lg font-bold tracking-tight">Northwood Supply Co.</span>
                <span className="block text-xs text-muted-foreground">Reporting automation demo</span>
              </span>
            </Link>
            <span className="demo-badge"><span aria-hidden="true" />Fictional business · Simulated data</span>
          </div>
        </header>
        <div className="shell-container">
          <WorkflowNav />
          <main id="main-content" tabIndex={-1} className="pb-14 outline-none">{children}</main>
          <footer className="site-footer">
            <p>Northwood Supply Co. is a fictional Ontario apparel retailer.</p>
            <p>A portfolio demonstration · All data is simulated</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
