export type SalesChannel = "Online" | "POS";

export type DashboardFilters = {
  startMonth: string;
  endMonth: string;
  channel: "All" | SalesChannel;
};

export type DashboardOrder = {
  orderId: string;
  month: string;
  channel: SalesChannel;
  netSales: number;
};

export type DashboardOrderLine = {
  orderId: string;
  month: string;
  channel: SalesChannel;
  merchandiseNetSales: number;
  grossProfit: number;
  unitCost: number | null;
};

export type DashboardData = {
  orders: DashboardOrder[];
  orderLines: DashboardOrderLine[];
};

export type DashboardKpis = {
  netSales: number;
  orders: number;
  averageOrderValue: number | null;
  grossProfit: number;
  grossMargin: number | null;
  merchandiseNetSales: number;
  unverifiedCostLines: number;
};
