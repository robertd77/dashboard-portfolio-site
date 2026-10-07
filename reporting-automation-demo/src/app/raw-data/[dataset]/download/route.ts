import { readFile } from "node:fs/promises";
import { findRawDataset } from "@/lib/datasets";
import { rawDatasetPath } from "@/lib/raw-data";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ dataset: string }> },
) {
  const { dataset: id } = await params;
  const dataset = findRawDataset(id);

  if (!dataset) {
    return new Response("Dataset not found", { status: 404 });
  }

  const content = await readFile(rawDatasetPath(dataset));

  return new Response(new Uint8Array(content), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${dataset.filename}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
