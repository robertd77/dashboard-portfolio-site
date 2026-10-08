import type { RawInputs, RawRow, ReportingDataset, ReportingRow } from "./types";

export function normalizeSku(value: string) {
  // Only normalize the known NW#### formatting variant; do not guess a product.
  return value.trim().toUpperCase().replace(/^NW(\d{4})$/, "NW-$1");
}

function numeric(row: RawRow, field: string, allowBlank = false) {
  const value = row[field];
  if (value === undefined || (value.trim() === "" && !allowBlank)) {
    throw new Error(`Missing numeric value in ${field}.`);
  }
  const result = Number(value);
  if (!Number.isFinite(result)) throw new Error(`Invalid numeric value in ${field}.`);
  return result;
}

function required(row: RawRow, field: string) {
  if (!row[field]?.trim()) throw new Error(`Missing required value in ${field}.`);
  return row[field];
}

function timestamp(value: string) {
  // Keep source local dates; do not shift them through a browser/server timezone.
  if (!/^\d{4}-\d{2}-\d{2}(?: \d{2}:\d{2}:\d{2})?$/.test(value)) {
    throw new Error("Invalid source date format.");
  }
  const date = value.slice(0, 10);
  if (!Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) {
    throw new Error("Invalid source date.");
  }
  if (value.length > 10 && (Number(value.slice(11, 13)) > 23 || Number(value.slice(14, 16)) > 59 || Number(value.slice(17, 19)) > 59)) {
    throw new Error("Invalid source time.");
  }
  return value.length === 10 ? `${value} 00:00:00` : value;
}

function uniqueIndex(rows: ReportingRow[], key: string) {
  const index = new Map<string, ReportingRow>();
  for (const row of rows) {
    const id = String(row[key]);
    if (!id || index.has(id)) throw new Error(`Missing or duplicate ${key}.`);
    index.set(id, row);
  }
  return index;
}

function dataset(id: string, name: string, rows: ReportingRow[], headers: string[]): ReportingDataset {
  return { id, name, filename: `${id}.csv`, rows, headers };
}

export function transformRawData(input: RawInputs) {
  const products = input.products.map((row) => {
    const cost = numeric(row, "Cost per Item");
    const inventory = numeric(row, "Inventory Quantity");
    const price = numeric(row, "Variant Price");
    if (cost < 0 || price < 0 || !Number.isInteger(inventory)) throw new Error("Invalid product cost, price, or inventory.");
    return {
      sku_clean: normalizeSku(required(row, "Variant SKU")), product_name: required(row, "Title"),
      category: row["Product Category"], variant: row["Variant Title"], current_retail_price: price,
      unit_cost: cost, inventory_quantity: inventory, product_status: row.Status,
      inventory_value_at_cost: cost * inventory,
    };
  });
  const productIndex = uniqueIndex(products, "sku_clean");
  const customers = input.customers.map((row) => ({
    customer_id: required(row, "Customer ID"), first_name: row["First Name"], last_name: row["Last Name"],
    email: row.Email, city: row.City, province: row.Province, country: row.Country,
    customer_created_at: timestamp(required(row, "Created At")), marketing_accepts: row["Marketing Accepts"],
    source_total_spent: numeric(row, "Total Spent"), source_total_orders: numeric(row, "Total Orders"),
  }));
  uniqueIndex(customers, "customer_id");
  let vendorAliases = 0;
  let categoryAliases = 0;
  const expenses = input.expenses.map((row) => {
    const vendor = ["Meta", "Facebook Ads"].includes(row.Vendor) ? "Meta Ads" : row.Vendor;
    const category = ["Freight & Delivery", "Postage"].includes(row["Account/Category"]) ? "Shipping & Delivery" : row["Account/Category"];
    vendorAliases += Number(vendor !== row.Vendor);
    categoryAliases += Number(category !== row["Account/Category"]);
    const date = timestamp(required(row, "Date"));
    return {
      transaction_id: required(row, "Number"), date, expense_month: date.slice(0, 7),
      transaction_type: row["Transaction Type"], vendor_raw: row.Vendor, vendor,
      category_raw: row["Account/Category"], category, description: row["Memo/Description"], amount: numeric(row, "Amount"),
    };
  });
  uniqueIndex(expenses, "transaction_id");

  const groups = new Map<string, RawRow[]>();
  for (const row of input.orders) {
    const id = required(row, "Name");
    const group = groups.get(id) ?? [];
    group.push(row);
    groups.set(id, group);
  }
  const orderIndex = new Map<string, ReportingRow>();
  const grossByOrder = new Map<string, number>();
  for (const [id, rows] of groups) {
    const firstValue = (field: string) => {
      const values = [...new Set(rows.map((row) => row[field]).filter((value) => value !== ""))];
      if (values.length > 1 || values.some((value) => value === undefined)) throw new Error(`Conflicting or missing ${field} for order ${id}.`);
      return values[0] ?? "";
    };
    const first: RawRow = Object.fromEntries(Object.keys(rows[0]).map((key) => [key, rows[0][key]]));
    // Order-level values are taken once, never summed across repeated line rows.
    for (const key of ["Subtotal", "Shipping", "Taxes", "Total", "Discount Code", "Discount Amount", "Created at", "Customer ID", "Source", "Financial Status", "Currency", "Location", "Fulfillment Status"]) {
      first[key] = firstValue(key);
    }
    const status = required(first, "Financial Status");
    if (!["paid", "voided", "refunded", "partially_refunded"].includes(status)) throw new Error(`Unsupported financial status for ${id}.`);
    if (!["online_store", "pos"].includes(first.Source)) throw new Error(`Unsupported sales channel for ${id}.`);
    const customerId = first["Customer ID"];
    const date = timestamp(required(first, "Created at"));
    let units = 0;
    let gross = 0;
    let refund = 0;
    for (const row of rows) {
      const quantity = numeric(row, "Lineitem quantity");
      const price = numeric(row, "Lineitem price");
      const lineRefund = numeric(row, "Refunded Amount", true);
      if (!Number.isInteger(quantity) || quantity <= 0 || price < 0 || lineRefund < 0) throw new Error(`Invalid quantity, price, or refund for ${id}.`);
      units += quantity;
      gross += quantity * price;
      // In these exports each row carries its allocated line refund.
      refund += lineRefund;
    }
    const total = numeric(first, "Total");
    const discount = numeric(first, "Discount Amount", true);
    const subtotal = numeric(first, "Subtotal");
    if (total < 0 || discount < 0 || discount > gross || Math.abs(subtotal - gross) > 0.005) throw new Error(`Invalid totals or discount for ${id}.`);
    grossByOrder.set(id, gross);
    orderIndex.set(id, {
      order_id: id, order_date: date, order_month: date.slice(0, 7), customer_id: customerId,
      customer_type: customerId ? "Identified" : "Guest / Unidentified", sales_channel: first.Source === "pos" ? "POS" : "Online",
      location: first.Location, financial_status: status, fulfillment_status: first["Fulfillment Status"], currency: first.Currency,
      subtotal, discount_code: first["Discount Code"], discount_amount: discount,
      shipping: numeric(first, "Shipping"), taxes: numeric(first, "Taxes"), gross_order_total: total,
      refund_amount: refund, net_sales: status === "voided" ? 0 : total - refund, units, line_count: rows.length,
    });
  }

  let normalizedSkus = 0;
  const exceptions: ReportingRow[] = [];
  const orderLines = input.orders.map((row) => {
    const order = orderIndex.get(row.Name)!;
    const rawSku = row["Lineitem sku"];
    const sku = normalizeSku(rawSku);
    normalizedSkus += Number(rawSku !== sku);
    const product = productIndex.get(sku);
    const match = !sku ? "Missing SKU" : product ? "Matched" : "Unmatched SKU";
    const quantity = numeric(row, "Lineitem quantity");
    const price = numeric(row, "Lineitem price");
    const gross = quantity * price;
    const orderGross = grossByOrder.get(row.Name)!;
    const discount = orderGross === 0 ? 0 : Number(order.discount_amount) * gross / orderGross;
    const refund = numeric(row, "Refunded Amount", true);
    const net = order.financial_status === "voided" ? 0 : gross - discount - refund;
    // Preserve reference precision. Discounts reduce revenue, not acquisition cost.
    const retainedCostRatio = gross > 0 ? Math.max(0, 1 - refund / gross) : refund > 0 ? 0 : 1;
    const cost = order.financial_status === "voided" ? 0 : Number(product?.unit_cost ?? 0) * quantity * retainedCostRatio;
    const profit = net - cost;
    if (!product) {
      exceptions.push({
        source: "orders.csv", order_id: row.Name, sku_raw: rawSku, lineitem_name: row["Lineitem name"], sku_match_status: match,
        action: "Review product match; retained with product attributes blank",
      });
    }
    return {
      order_id: order.order_id, order_date: order.order_date, order_month: order.order_month,
      customer_id: order.customer_id, customer_type: order.customer_type, sales_channel: order.sales_channel, financial_status: order.financial_status,
      sku_raw: rawSku, sku_clean: sku, sku_match_status: match, lineitem_name: row["Lineitem name"],
      product_name: product?.product_name ?? "", category: product?.category ?? "", variant: product?.variant ?? "",
      quantity, unit_price: price, unit_cost: product?.unit_cost ?? null, gross_line_sales: gross,
      allocated_discount: discount, line_refund: refund, net_line_sales: net, cogs: cost, gross_profit: profit,
      gross_margin_pct: net > 0 ? profit / net : null,
    };
  });
  const orders = [...orderIndex.values()];
  const total = (records: ReportingRow[], field: string) => records.reduce((sum, row) => sum + Number(row[field]), 0);
  const merchandiseNetSales = total(orderLines, "net_line_sales");
  const grossProfit = total(orderLines, "gross_profit");
  const orderNetSales = total(orders, "net_sales");
  const datasets = [
    dataset("orders_clean", "Orders", orders, ["order_id", "order_date", "order_month", "customer_id", "customer_type", "sales_channel", "location", "financial_status", "fulfillment_status", "currency", "subtotal", "discount_code", "discount_amount", "shipping", "taxes", "gross_order_total", "refund_amount", "net_sales", "units", "line_count"]),
    dataset("order_lines_clean", "Order lines", orderLines, ["order_id", "order_date", "order_month", "customer_id", "customer_type", "sales_channel", "financial_status", "sku_raw", "sku_clean", "sku_match_status", "lineitem_name", "product_name", "category", "variant", "quantity", "unit_price", "unit_cost", "gross_line_sales", "allocated_discount", "line_refund", "net_line_sales", "cogs", "gross_profit", "gross_margin_pct"]),
    dataset("products_clean", "Products & inventory", products, ["sku_clean", "product_name", "category", "variant", "current_retail_price", "unit_cost", "inventory_quantity", "product_status", "inventory_value_at_cost"]),
    dataset("customers_clean", "Customers", customers, ["customer_id", "first_name", "last_name", "email", "city", "province", "country", "customer_created_at", "marketing_accepts", "source_total_spent", "source_total_orders"]),
    dataset("expenses_clean", "Expenses", expenses, ["transaction_id", "date", "expense_month", "transaction_type", "vendor_raw", "vendor", "category_raw", "category", "description", "amount"]),
    dataset("data_quality_exceptions", "Exceptions for review", exceptions, ["source", "order_id", "sku_raw", "lineitem_name", "sku_match_status", "action"]),
  ];
  return {
    datasets,
    financials: {
      orderNetSales, merchandiseNetSales, cogs: total(orderLines, "cogs"), grossProfit,
      grossMargin: merchandiseNetSales > 0 ? grossProfit / merchandiseNetSales : null,
      unverifiedCostLines: exceptions.length,
    },
    summary: {
      orders: orders.length, orderLines: orderLines.length, products: products.length, customers: customers.length, expenses: expenses.length,
      normalizedSkus, missingSkus: exceptions.filter((r) => r.sku_match_status === "Missing SKU").length,
      unmatchedSkus: exceptions.filter((r) => r.sku_match_status === "Unmatched SKU").length,
      vendorAliases, categoryAliases, voidedOrders: orders.filter((r) => r.financial_status === "voided").length,
      refundedOrders: orders.filter((r) => Number(r.refund_amount) > 0).length,
      guestOrders: orders.filter((r) => !r.customer_id).length, datasetsGenerated: datasets.length,
      netSales: orderNetSales,
    },
  };
}
