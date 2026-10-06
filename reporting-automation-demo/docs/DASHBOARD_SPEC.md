# Dashboard Specification

## Goal

Provide a concise example of the kinds of management reporting a small
retailer could receive after its recurring reporting workflow has been
automated.

The dashboard should feel useful, not exhaustive. Limit the primary
experience to approximately five KPI cards and four charts.

## KPI cards

### Net Sales

Source: `orders_clean.csv` Definition: sum of `net_sales`.

Reference annual value: approximately **\$1.45M**.

### Orders

Source: `orders_clean.csv` Definition: distinct order count.

Reference annual value: **6,300**.

### Average Order Value

Source: `orders_clean.csv` Definition: net sales divided by orders.

Reference annual value: approximately **\$231**.

### Gross Profit

Source: `order_lines_clean.csv` Definition: sum of `gross_profit`.

### Gross Margin

Source: `order_lines_clean.csv` Definition: total gross profit divided
by total merchandise net sales.

Do not average row-level margin percentages.

## Chart 1 --- Monthly Sales Trend

Recommended form: line chart.

Primary measure: - Order-level net sales by month.

Purpose: - Show annual seasonality. - Make the strong Q4/holiday period
immediately visible.

Supporting context can include Orders or AOV in tooltips/KPIs rather
than adding excessive series.

Expected insight: - Q4 is the strongest sales period. - Q4 generated
roughly \$515K in order-level net sales and about 35% of annual sales. -
November and December also have higher AOV than the summer months.

## Chart 2 --- Revenue & Gross Profit by Category

Recommended form: grouped bar chart.

Source: `order_lines_clean.csv`.

Measures: - Merchandise net sales. - Gross profit.

Categories: - Tops - Sweaters & Hoodies - Pants & Shorts - Outerwear -
Accessories

Purpose: - Compare category scale and economics.

Expected insight: - Outerwear is the largest merchandise revenue
category. - It is particularly important in Q4. - Accessories have
stronger percentage margins but much lower absolute revenue.

If gross margin is shown, prefer tooltip/detail text rather than adding
a third incompatible visual scale to the same chart.

## Chart 3 --- Top Products & Inventory Coverage

Recommended form: compact horizontal bar chart plus adjacent values, or
a concise table-like visualization if that communicates the information
better.

Sources: - `order_lines_clean.csv` - `products_clean.csv`

Suggested product-level measures: - Merchandise sales. - Units sold. -
Current inventory. - Estimated months of stock based on recent sales
velocity.

Purpose: - Connect sales reporting to an operational decision.

Expected insight: - Several high-selling outerwear products have
relatively limited current stock coverage. - The Insulated Jacket is a
major sales driver and has comparatively low stock coverage.

Do not describe inventory coverage as a precise demand forecast.

## Chart 4 --- First vs Repeat Customer Sales

Recommended form: stacked monthly bars or another simple customer-mix
chart.

Sources: - `orders_clean.csv` - customer/order history.

Classification: - A customer's earliest order in the dataset is the
first purchase. - Later orders for the same identified customer are
repeat purchases. - Guest/unidentified orders should remain separate or
be excluded from the first/repeat comparison with clear labeling.

Purpose: - Demonstrate customer-level analysis and cross-record logic
beyond basic sales reporting.

Expected insight: - Repeat purchasing is an important contributor to
identifiable-customer revenue. - Repeat-customer value in the demo comes
primarily from purchase frequency rather than dramatically larger
individual baskets.

Because the dataset is simulated, avoid overemphasizing the exact repeat
rate as an industry benchmark.

## Filters

Keep controls minimal.

Useful options: - Date/month range. - Sales channel. - Product category
for product/category visuals.

Filtering should preserve correct metric grain. For example, avoid
duplicating order-level sales when filtering through line-item records.

## Insight copy

Dashboard annotations/case-study copy may summarize the patterns above,
but: - Do not imply causal attribution. - Do not claim simulated results
are industry benchmarks. - Keep Northwood clearly identified as
fictional/demo data.
