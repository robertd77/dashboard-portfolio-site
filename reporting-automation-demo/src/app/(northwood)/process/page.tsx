import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/page-heading";
import { ProcessingWorkflow } from "@/components/processing-workflow";

export const metadata: Metadata = {
  title: "Process & Validate",
  description: "Run the Northwood demo workflow to see source data cleaning, validation, and exception handling.",
  alternates: { canonical: "/process" },
  robots: { index: false, follow: true },
};

export default function ProcessPage() {
  return (
    <>
      <PageHeading step="02 / Process & Validate" title="Less cleanup. More consistency."
        description="Turn Northwood’s exports into consistent reporting data. Known formatting differences are cleaned up automatically; unresolved records stay visible for review." />
      <ProcessingWorkflow />
      <div className="mt-8 border-t border-border pt-6">
        <Button asChild variant="outline"><Link href="/raw-data"><ArrowLeft aria-hidden="true" />Back to Raw Data</Link></Button>
      </div>
    </>
  );
}
