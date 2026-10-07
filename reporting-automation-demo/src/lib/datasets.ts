export const rawDatasets = [
  {
    id: "orders",
    name: "Orders",
    filename: "orders.csv",
    source: "Shopify-style export",
    description: "Order and line-item records from online and point-of-sale purchases, including refunds and cancellations. An order can span multiple rows.",
  },
  {
    id: "products",
    name: "Products & inventory",
    filename: "products_inventory.csv",
    source: "Shopify-style export",
    description: "The product master: SKUs, categories, unit costs, retail prices, and current inventory.",
  },
  {
    id: "customers",
    name: "Customers",
    filename: "customers.csv",
    source: "Shopify-style export",
    description: "Customer records for identified shoppers. Guest orders remain part of the reporting workflow.",
  },
  {
    id: "expenses",
    name: "Expenses",
    filename: "expenses.csv",
    source: "Accounting-style export",
    description: "An operational expense sample with vendor and category details. This is not a complete accounting ledger.",
  },
] as const;

export type RawDataset = (typeof rawDatasets)[number];
export type RawDatasetId = RawDataset["id"];

export type DatasetPreview = RawDataset & {
  headers: string[];
  rows: string[][];
  rowCount: number;
};

export function findRawDataset(id: string) {
  return rawDatasets.find((dataset) => dataset.id === id);
}
