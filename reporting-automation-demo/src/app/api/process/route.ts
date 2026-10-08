import { runReportingWorkflow, workflowView } from "@/lib/processing/workflow";

export const runtime = "nodejs";

export async function POST() {
  try {
    const result = await runReportingWorkflow();
    return Response.json(workflowView(result), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Reporting workflow failed:", error);
    return Response.json({ error: "The reporting workflow could not finish. Please try again. If this continues, the supplied files or reporting rules need review." }, { status: 500 });
  }
}
