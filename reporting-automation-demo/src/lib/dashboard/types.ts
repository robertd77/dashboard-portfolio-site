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
  orderDate: string;
  customerId: string;
};

export type DashboardOrderLine = {
  orderId: string;
  month: string;
  channel: SalesChannel;
  merchandiseNetSales: number;
  grossProfit: number;
  unitCost: number | null;
  sku: string;
  productName: string;
  category: string;
  quantity: number;
  financialStatus: string;
};

export type DashboardProduct = { sku: string; name: string; category: string; inventory: number };

export type DashboardData = {
  orders: DashboardOrder[];
  orderLines: DashboardOrderLine[];
  products: DashboardProduct[];
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
