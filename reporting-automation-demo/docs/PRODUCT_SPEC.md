# Product Specification

## 1. Product concept

This project demonstrates a consulting service that **automates
repetitive spreadsheet and reporting workflows for small businesses**.

The service is not positioned primarily as dashboard development. The
core value proposition is taking a recurring manual workflow involving
exports, spreadsheet cleanup, formulas, lookups, reporting, and
distribution and replacing most of that work with a reliable automated
process.

The Northwood demo should communicate:

> Raw business exports can be cleaned, validated, transformed, and
> turned into useful management reporting with much less recurring
> manual work.

## 2. Fictional business

**Northwood Supply Co.** is a fictional independent Ontario apparel
retailer.

Approximate profile: - Mostly ecommerce with one small physical
storefront. - Shopify online store plus Shopify POS. -
Casual/outdoor-inspired apparel. - Roughly 12--15 employees. - Roughly
\$1.3M--\$1.5M annual sales scale. - Roughly 6,000--7,000 annual
orders. - Approximately 80% online / 20% POS. - Approximately 20--25
product styles and about 80 SKUs. - Categories: Tops, Sweaters &
Hoodies, Pants & Shorts, Outerwear, Accessories. - No dedicated
analyst. - Operations/finance staff currently handle recurring
reporting.

The dataset covers one year: 2025.

## 3. Original manual workflow

The fictional existing process is:

1.  Export Shopify orders.
2.  Export Shopify products/inventory.
3.  Export Shopify customers.
4.  Export accounting expenses.
5.  Paste/update spreadsheets.
6.  Clean SKU/category/vendor inconsistencies.
7.  Match products and costs.
8.  account for cancelled and refunded orders.
9.  Calculate sales, COGS, gross profit, and margin.
10. Refresh pivots/charts.
11. Review and send management reporting.

The demo should show how this becomes a guided automated workflow.

## 4. Public demo experience

The demo should be intentionally compact.

Suggested primary flow:

**Raw Data → Process & Validate → Dashboard**

### Raw Data

Allow visitors to inspect the four fictional raw exports: -
`orders.csv` - `products_inventory.csv` - `customers.csv` -
`expenses.csv`

Useful behavior: - Show filename, row count, and a table preview. -
Explain what each export represents. - Optionally provide download links
for the fictional sample files. - Clearly label the data as simulated.

Do not require arbitrary user uploads for the initial version.

### Process & Validate

Provide a clear action such as **Run reporting workflow**.

The workflow should genuinely execute or demonstrate the defined
transformations, rather than being only a fake progress animation.

A result summary can show items such as: - 10,203 order lines processed
across 6,300 orders. - Obvious SKU formatting inconsistencies
normalized. - Six missing-SKU lines flagged for review. - Refund and
cancellation rules applied. - Expense vendor/category aliases
standardized. - Guest orders retained without forced customer
matching. - Reporting dataset ready.

The exact displayed counts should come from the actual demo data
wherever practical.

### Dashboard

Show a concise management dashboard with KPI cards and four charts
defined in `DASHBOARD_SPEC.md`.

Use only a few useful controls, such as: - Date/month range. - Sales
channel. - Product category where applicable.

The goal is not to build a full BI product.

## 5. Case-study page

The Northwood case study should eventually explain:

### Problem

Monthly management reporting depends on multiple exports and manual
spreadsheet work.

### Inputs

Show the four source files and the types of data they contain.

### Data issues

The demo includes a small number of ordinary problems: - SKU
formatting/missing SKU values. - Refund/cancellation business rules. -
Expense vendor/category aliases. - Customer identity gaps from guest
checkout/email changes.

These should not be presented as catastrophic data quality.

### Solution

Explain the automated flow: **Export → Validate → Normalize → Transform
→ Review exceptions → Report**

### Outcome

Focus on: - Less recurring spreadsheet work. - Consistent metric
definitions. - Visible exceptions rather than silent errors. - Faster
access to management insights.

### Insights

Use the findings represented by the dashboard. Do not claim causal
relationships that the data cannot establish.

## 6. Broader consulting positioning

The site can explain that real client delivery could use the tools that
fit the business, such as: - Existing spreadsheets. - Power BI. - Looker
Studio. - A custom web dashboard. - Automated PDF/email reports.

The Northwood demo uses a custom web interface because it makes the
complete workflow easy to demonstrate publicly.

## 7. Scope exclusions

The initial demo does not need: - Authentication. - Multi-tenant
accounts. - Database persistence. - Shopify API integration. -
QuickBooks/Xero API integration. - Arbitrary file/schema ingestion. -
Billing. - Complex permissions. - Production SaaS infrastructure.

Static sample CSVs and deterministic processing are sufficient.
