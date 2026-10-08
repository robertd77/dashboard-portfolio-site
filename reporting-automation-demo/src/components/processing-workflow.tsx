"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ListChecks, LoaderCircle, Play, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProcessingResults } from "@/components/processing-results";
import type { WorkflowView } from "@/lib/processing/types";

const stages = [
  { title: "Load & check source exports", running: "Reading the four exports and checking their columns and records." },
  { title: "Normalize & match products", running: "Standardizing SKU formats and connecting order lines to product details." },
  { title: "Apply reporting rules & retain exceptions", running: "Applying refunds, cancellations, and expense aliases while retaining unresolved records." },
  { title: "Reconcile reporting datasets", running: "Comparing the generated reporting records and totals with the reference outputs." },
];

function pauseStage(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException("Guided run cancelled", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, 5000);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
  });
}

function completionMessages(data: WorkflowView) {
  const count = (value: number) => value.toLocaleString("en-CA");
  const { summary } = data;
  return [
    `${count(summary.orderLines)} order lines, ${count(summary.products)} products, ${count(summary.customers)} customers, and ${count(summary.expenses)} expenses loaded.`,
    `${count(summary.normalizedSkus)} SKU formats normalized; ${count(summary.missingSkus + summary.unmatchedSkus)} unresolved product matches retained for review.`,
    `${count(summary.orders)} orders prepared; ${count(summary.refundedOrders)} refunds and ${count(summary.voidedOrders)} cancellations accounted for. ${count(summary.vendorAliases + summary.categoryAliases)} expense aliases standardized.`,
    data.reconciliation.passed
      ? `All ${count(summary.datasetsGenerated)} generated datasets matched the reference checks.`
      : "Reporting datasets generated. Reference differences need review before continuing.",
  ];
}

export function ProcessingWorkflow() {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<WorkflowView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(0);
  const [runData, setRunData] = useState<WorkflowView | null>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  async function run() {
    if (controller.current && !controller.current.signal.aborted && pending) return;
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setPending(true); setResult(null); setError(null); setCompleted(0); setRunData(null);
    try {
      const response = await fetch("/api/process", { method: "POST", signal: current.signal });
      if (!response.ok) throw new Error("Processing failed.");
      const data: WorkflowView = await response.json();
      if (current.signal.aborted) return;
      setRunData(data);
      // Pace the presentation only after real processing returns. Never invent success.
      for (let stage = 0; stage < stages.length; stage += 1) {
        await pauseStage(current.signal);
        setCompleted(stage + 1);
      }
      setResult(data);
    } catch {
      if (!current.signal.aborted) setError("The reporting workflow could not finish. Please try again. If this continues, the source files or reporting rules need review.");
    } finally {
      if (!current.signal.aborted) setPending(false);
    }
  }

  const ready = result?.reconciliation.passed;
  const messages = runData ? completionMessages(runData) : [];
  const activeMessage = pending ? `Step ${Math.min(completed + 1, stages.length)} of ${stages.length}: ${stages[Math.min(completed, stages.length - 1)].running}` : null;
  return (
    <>
      <Card className="stage-placeholder">
        <span className="icon-tile mb-5"><ListChecks size={25} aria-hidden="true" /></span>
        <p className="status-label">{pending ? "Workflow running" : result ? ready ? "Workflow complete" : "Review required" : "Ready to process"}</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">{pending ? "Your reporting workflow is running." : result ? ready ? "Reporting data is ready." : "The generated results need review." : "Four exports. One repeatable workflow."}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">Run the workflow to load the simulated exports, normalize known inconsistencies, apply reporting rules, and compare newly generated datasets with the reference outputs. Original files are preserved.</p>
        <p className="mt-3 text-xs leading-6 text-muted-foreground">Guided demo: stages are paced over about 20 seconds to make the workflow visible. Timing is illustrative; results are calculated from the supplied files.</p>
        <ol className="mt-7 space-y-3">
          {stages.map((stage, index) => {
            const done = index < completed;
            const active = pending && index === completed;
            const review = done && index === stages.length - 1 && runData && !runData.reconciliation.passed;
            const failed = Boolean(error) && index === completed;
            const status = review ? "Needs review" : failed ? "Stopped" : done ? "Completed" : active ? "Running" : "Waiting";
            return (
              <li key={stage.title} aria-current={active ? "step" : undefined} className={`rounded-lg border p-4 ${active ? "border-primary bg-secondary" : "border-border"}`}>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 text-primary" aria-hidden="true">
                    {review || failed ? <TriangleAlert size={19} /> : done ? <CheckCircle2 size={19} /> : active ? <LoaderCircle size={19} className="motion-safe:animate-spin" /> : <span className="block w-5 text-xs font-semibold">0{index + 1}</span>}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold">{stage.title}</h3>
                      <span className="text-xs font-semibold text-muted-foreground">{status}</span>
                    </div>
                    <p className="mt-2 text-xs leading-6 text-muted-foreground">{failed ? "No completed output is available. Please retry the workflow." : done ? messages[index] : active ? stage.running : "Ready for this stage of the workflow."}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        {(pending || result) && <progress max={stages.length} value={completed} aria-label="Workflow stages completed" className="mt-5 h-2 w-full accent-primary" />}
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <Button className="cursor-pointer" onClick={run} disabled={pending}>
            {pending ? <LoaderCircle className="motion-safe:animate-spin" aria-hidden="true" /> : <Play aria-hidden="true" />}
            {pending ? "Running workflow…" : result ? "Run workflow again" : "Run Reporting Workflow"}
          </Button>
          <p role="status" aria-live="polite" className="flex items-center gap-2 text-sm text-muted-foreground">
            {pending ? activeMessage : result ? <>{ready ? <CheckCircle2 size={16} aria-hidden="true" /> : <TriangleAlert size={16} aria-hidden="true" />}{ready ? "Processing and reconciliation finished." : "Processing finished; reconciliation differences remain."}</> : error ? "Workflow stopped. No completion has been reported." : "No processing has run in this view yet."}
          </p>
        </div>
        {error && <p role="alert" className="mt-5 rounded-lg border border-border bg-secondary p-4 text-sm leading-6">{error}</p>}
      </Card>
      {result && <ProcessingResults result={result} />}
    </>
  );
}
