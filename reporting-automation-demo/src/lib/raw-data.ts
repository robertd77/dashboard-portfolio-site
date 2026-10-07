import "server-only";

import path from "node:path";
import { readCsvFile } from "@/lib/csv";
import { rawDatasets, type RawDataset, type DatasetPreview } from "@/lib/datasets";

export const PREVIEW_ROW_LIMIT = 20;

// Accept only a catalog entry; route input is never used as a filesystem path.
export function rawDatasetPath(dataset: RawDataset) {
  return path.join(process.cwd(), "data", "raw", dataset.filename);
}

export async function loadRawDatasetPreviews(): Promise<DatasetPreview[]> {
  return Promise.all(rawDatasets.map(async (dataset) => {
    const { headers, rows } = await readCsvFile(rawDatasetPath(dataset));

    return {
      ...dataset,
      headers,
      rowCount: rows.length,
      rows: rows.slice(0, PREVIEW_ROW_LIMIT),
    };
  }));
}
