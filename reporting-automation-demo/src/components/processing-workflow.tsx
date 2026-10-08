"use client";

import { useState } from "react";
import { CheckCircle2, ListChecks, LoaderCircle, Play, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProcessingResults } from "@/components/processing-results";
import type { WorkflowView } from "@/lib/processing/types";

export function ProcessingWorkflow() {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<WorkflowView | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setPending(true); setResult(null); setError(null);
    try {
      const response = await fetch("/api/process", { method: "POST" });
      if (!response.ok) throw new Error("Processing failed.");
      const data: WorkflowView = await response.json();
      setResult(data);
    } catch {
      setError("The reporting workflow could not finish. Please try again. If this continues, the source files or reporting rules need review.");
    } finally {
      setPending(false);
    }
  }

  const ready = result?.reconciliation.passed;
  return (
    <>
      <Card className="stage-placeholder" aria-busy={pending}>
        <span className="icon-tile mb-5"><ListChecks size={25} aria-hidden="true" /></span>
        <p className="status-label">{pending ? "Workflow running" : result ? ready ? "Workflow complete" : "Review required" : "Ready to process"}</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">{result ? ready ? "Reporting data is ready." : "The generated results need review." : "Four exports. One repeatable workflow."}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">Run the workflow to load the simulated exports, normalize known inconsistencies, apply reporting rules, and compare newly generated datasets with the reference outputs. Original files are preserved.</p>
        <ol className="mt-7 grid gap-3 text-sm sm:grid-cols-2">
          <li className="planned-item">01 · Load & check source exports</li>
          <li className="planned-item">02 · Normalize & match products</li>
          <li className="planned-item">03 · Apply reporting rules & retain exceptions</li>
          <li className="planned-item">04 · Reconcile reporting datasets</li>
        </ol>
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <Button className="cursor-pointer" onClick={run} disabled={pending}>
            {pending ? <LoaderCircle className="motion-safe:animate-spin" aria-hidden="true" /> : <Play aria-hidden="true" />}
            {pending ? "Running workflow…" : result ? "Run workflow again" : "Run Reporting Workflow"}
          </Button>
          <p role="status" aria-live="polite" className="flex items-center gap-2 text-sm text-muted-foreground">
            {pending ? "Processing the source files and checking references…" : result ? <>{ready ? <CheckCircle2 size={16} aria-hidden="true" /> : <TriangleAlert size={16} aria-hidden="true" />}{ready ? "Processing and reconciliation finished." : "Processing finished; reconciliation differences remain."}</> : "No processing has run in this view yet."}
          </p>
        </div>
        {error && <p role="alert" className="mt-5 rounded-lg border border-border bg-secondary p-4 text-sm leading-6">{error}</p>}
      </Card>
      {result && <ProcessingResults result={result} />}
    </>
  );
}
