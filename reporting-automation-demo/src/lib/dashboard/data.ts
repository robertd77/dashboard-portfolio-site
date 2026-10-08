import type { ReportingRow, WorkflowResult } from "../processing/types";
import type { DashboardData, SalesChannel } from "./types";

function text(row: ReportingRow, field: string) {
  const value = row[field];
  if (typeof value !== "string" || !value) throw new Error(`Missing dashboard field: ${field}.`);
  return value;
}

function number(row: ReportingRow, field: string) {
  const value = row[field];
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`Invalid dashboard field: ${field}.`);
  return value;
}

function channel(row: ReportingRow): SalesChannel {
  const value = text(row, "sales_channel");
  if (value !== "Online" && value !== "POS") throw new Error("Unknown reporting sales channel.");
  return value;
}

/** Project already-transformed records into a compact dashboard payload; no business rules are rerun here. */
export function dashboardDataFromWorkflow(result: WorkflowResult): DashboardData {
  if (!result.reconciliation.passed) throw new Error("Dashboard reporting data needs reconciliation review.");
  const orders = result.datasets.find((dataset) => dataset.id === "orders_clean");
  const lines = result.datasets.find((dataset) => dataset.id === "order_lines_clean");
  if (!orders || !lines) throw new Error("Dashboard reporting datasets are missing.");
  return {
    orders: orders.rows.map((row) => ({
      orderId: text(row, "order_id"), month: text(row, "order_month"), channel: channel(row), netSales: number(row, "net_sales"),
    })),
    orderLines: lines.rows.map((row) => ({
      orderId: text(row, "order_id"), month: text(row, "order_month"), channel: channel(row),
      merchandiseNetSales: number(row, "net_line_sales"), grossProfit: number(row, "gross_profit"),
      unitCost: row.unit_cost === null ? null : number(row, "unit_cost"),
    })),
  };
}
