import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { StageNavigation } from "@/components/stage-navigation";
import { RawDataExplorer } from "@/components/raw-data-explorer";
import { loadRawDatasetPreviews } from "@/lib/raw-data";

export const metadata: Metadata = { title: "Raw Data" };

export default async function RawDataPage() {
  const datasets = await loadRawDatasetPreviews();
  return (
    <>
      <PageHeading step="01 / Raw Data" title="Every report starts with the source."
        description="These simulated exports show what Northwood Supply Co., a fictional retailer, might provide for recurring reporting. Four separate files from different systems are the starting point. Select a file to inspect its original records." />
      <RawDataExplorer datasets={datasets} />
      <aside className="scope-note mt-6" aria-label="Next workflow stage">
        <ArrowUpRight size={20} className="shrink-0 text-primary" aria-hidden="true" />
        <div><h2 className="text-sm font-semibold">Separate exports → consistent reporting</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">The next stage will bring these inputs together, apply consistent rules, and surface exceptions for review. Processing and validation are planned for a later step; these previews show the raw starting point.</p>
        </div>
      </aside>
      <StageNavigation index={0} />
    </>
  );
}
