# Data Specification

## 1. Raw inputs

The fictional client exports are stored under `data/raw/`.

### orders.csv

Shopify-style order/line-item export.

Important characteristics: - 6,300 orders. - 10,203 line-item rows. -
One order may span multiple rows. - Order-level fields such as Total,
Shipping, and Taxes are populated on the first row of a multi-line
order. - Contains online and POS orders. - Contains voided, refunded,
partially refunded, and paid orders.

Key fields include: - Name - Email - Created at - Financial Status -
Fulfillment Status - Currency - Subtotal - Shipping - Taxes - Total -
Discount Code - Discount Amount - Lineitem quantity - Lineitem name -
Lineitem price - Lineitem sku - Refunded Amount - Location - Source -
Customer ID

### products_inventory.csv

Shopify-style product/inventory master.

Key fields: - Handle - Title - Vendor - Product Category - Variant
Title - Variant SKU - Variant Price - Cost per Item - Inventory
Quantity - Status

This is the primary source for product category, unit cost, and current
inventory.

### customers.csv

Shopify-style customer export.

Key fields: - Customer ID - First Name - Last Name - Email - City -
Province - Country - Created At - Marketing Accepts - Total Spent -
Total Orders

Revenue reporting should be calculated from orders rather than relying
on the source lifetime summary fields.

### expenses.csv

Accounting-style transaction export.

Key fields: - Date - Transaction Type - Number - Vendor -
Account/Category - Memo/Description - Amount

This is an operational expense sample, not a complete general ledger.

## 2. Intentional realistic issues

### SKU matching

A small number of order lines use a formatting variant such as `NW1042`
instead of `NW-1042`. Normalize obvious formatting differences before
joining to the product master.

Six order lines have no SKU. Do not invent a match. Retain the lines and
flag them for review.

### Refunds and cancellations

These are legitimate transactional states, not corrupt data.

Rules: - Voided orders contribute zero net sales. - Full and partial
refunds reduce net sales. - Preserve the original status for
auditability.

### Expense aliases

Normalize obvious aliases for reporting while retaining raw values.

Vendor mapping: - `Meta` → `Meta Ads` - `Facebook Ads` → `Meta Ads`

Category mapping: - `Freight & Delivery` → `Shipping & Delivery` -
`Postage` → `Shipping & Delivery`

### Customer identity

Use stable `Customer ID` as the primary customer key.

Some POS/guest orders do not have a customer ID. Retain them as
guest/unidentified orders rather than attempting fuzzy identity
matching.

Do not use email as the primary key; a small number of customers have
changed email addresses.

## 3. Clean reporting outputs

Reference clean datasets are stored under `data/clean/`.

### orders_clean.csv

Grain: one row per order.

Use for: - Net sales. - Order count. - AOV. - Channel mix. -
Customer/order trends. - Monthly reporting.

Important fields: - order_id - order_date - order_month - customer_id -
customer_type - sales_channel - financial_status - subtotal -
discount_amount - shipping - taxes - gross_order_total - refund_amount -
net_sales - units - line_count

### order_lines_clean.csv

Grain: one row per product line.

Use for: - Merchandise/product revenue. - Units sold. - Category
analysis. - COGS. - Gross profit. - Gross margin. - Product performance.

Important fields: - order_id - order_date - order_month - customer_id -
sales_channel - sku_raw - sku_clean - sku_match_status - product_name -
category - variant - quantity - unit_price - unit_cost -
gross_line_sales - allocated_discount - line_refund - net_line_sales -
cogs - gross_profit - gross_margin_pct

### expenses_clean.csv

Grain: one accounting transaction.

Retain both raw and normalized vendor/category fields.

### customers_clean.csv

Supporting customer dimension.

### products_clean.csv

Supporting product/inventory dimension, including inventory value at
cost.

### data_quality_exceptions.csv

Contains unresolved missing-SKU cases. Exceptions should remain visible
rather than being silently removed.

## 4. Metric definitions

### Net Sales

Use `orders_clean.net_sales` for order-level sales reporting.

The current reference transformation: - sets voided orders to zero; -
subtracts recorded refunds.

Order-level net sales include components represented in the order total,
including tax/shipping. Label this measure clearly.

### Orders

Distinct `order_id`.

### Average Order Value

`SUM(net_sales) / COUNT(DISTINCT order_id)`

When filters are applied, calculate from the filtered order set.

### Merchandise Net Sales

Use `order_lines_clean.net_line_sales`.

This is a line-item/product measure and intentionally differs from
order-level net sales because it does not represent all order-level
shipping/tax components.

### COGS

Use `order_lines_clean.cogs`.

The reference demo reverses COGS proportionally for refunded merchandise
and assigns zero COGS to voided orders.

### Gross Profit

`net_line_sales - cogs`

### Gross Margin

`SUM(gross_profit) / SUM(net_line_sales)`

Prefer weighted aggregate margin rather than averaging row-level
percentages.

### Inventory coverage

For the demo, estimate months of stock using current inventory divided
by recent monthly unit sales velocity. Use a clearly documented recent
period such as the latest three months.

Treat this as an operational estimate, not a forecast.

## 5. Reconciliation expectations

The supplied reference clean data currently reconciles to: - 6,300
orders. - 10,203 order lines. - \$1,452,137.84 order-level net sales. -
Six unresolved missing-SKU exceptions.

When reimplementing transformations, compare output to the reference
clean datasets and investigate discrepancies rather than silently
changing definitions.

## 6. Important limitations

-   Do not claim the expense data represents complete financial
    statements.
-   Do not calculate or label a GAAP/net-profit metric from the provided
    expense file.
-   Do not claim advertising caused sales changes; the data does not
    contain campaign attribution.
-   Do not assume order-level net sales and merchandise line revenue
    should exactly match.
