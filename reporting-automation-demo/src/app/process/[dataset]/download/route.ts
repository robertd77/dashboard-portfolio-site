import { runReportingWorkflow } from "@/lib/processing/workflow";
import { serializeDataset } from "@/lib/processing/reconcile";

export const runtime = "nodejs";

const datasetIds = new Set(["orders_clean", "order_lines_clean", "products_clean", "customers_clean", "expenses_clean", "data_quality_exceptions"]);

export async function GET(_request: Request, { params }: { params: Promise<{ dataset: string }> }) {
  const { dataset: id } = await params;
  if (!datasetIds.has(id)) return new Response("Dataset not found", { status: 404 });
  try {
    const result = await runReportingWorkflow();
    if (!result.reconciliation.passed) {
      return new Response("Generated reporting data needs reconciliation review before download.", { status: 409 });
    }
    const dataset = result.datasets.find((candidate) => candidate.id === id)!;
    return new Response(serializeDataset(dataset), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${dataset.filename}"`,
        "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Reporting dataset download failed:", error);
    return new Response("The reporting dataset could not be generated. Please run the workflow again.", { status: 500 });
  }
}
