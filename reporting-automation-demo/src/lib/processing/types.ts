export type RawRow = Record<string, string>;
export type ReportingRow = Record<string, string | number | null>;

export type RawInputs = {
  orders: RawRow[];
  products: RawRow[];
  customers: RawRow[];
  expenses: RawRow[];
};

export type ReportingDataset = {
  id: string;
  name: string;
  filename: string;
  headers: string[];
  rows: ReportingRow[];
};

export type ProcessingSummary = {
  orders: number;
  orderLines: number;
  products: number;
  customers: number;
  expenses: number;
  normalizedSkus: number;
  missingSkus: number;
  unmatchedSkus: number;
  vendorAliases: number;
  categoryAliases: number;
  voidedOrders: number;
  refundedOrders: number;
  guestOrders: number;
  datasetsGenerated: number;
  netSales: number;
};

export type ReconciliationCheck = {
  filename: string;
  generatedRows: number;
  referenceRows: number;
  passed: boolean;
  mismatchedCells: number;
  examples: string[];
};

export type WorkflowResult = {
  datasets: ReportingDataset[];
  summary: ProcessingSummary;
  financials: {
    orderNetSales: number;
    merchandiseNetSales: number;
    cogs: number;
    grossProfit: number;
    grossMargin: number | null;
    unverifiedCostLines: number;
  };
  reconciliation: { passed: boolean; checks: ReconciliationCheck[] };
};

export type WorkflowView = {
  summary: ProcessingSummary;
  reconciliation: WorkflowResult["reconciliation"];
  exceptions: ReportingRow[];
  datasets: { id: string; name: string; filename: string; rowCount: number }[];
};
