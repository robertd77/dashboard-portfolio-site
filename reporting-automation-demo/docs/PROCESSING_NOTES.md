# Processing conventions and reconciliation

Northwood Supply Co. is fictional. These are simulated reporting exports.

## Architecture

`processing/transform.ts` takes parsed raw records and returns six newly
generated reporting datasets plus processing counts. It does not load
reference data. `processing/workflow.ts` loads files with the shared CSV
parser, checks expected headers and row structures, transforms raw data,
and only then loads reference outputs for comparison.

The `POST /api/process` route returns summary information and exceptions
for the interface. `runReportingWorkflow()` also exposes complete typed
dataset containers for subsequent dashboard development. Nothing is
persisted. Generated download routes call the same function and serialize
newly computed records; they never return copies of the reference CSVs.

## Financial conventions

- Order-level fields use one populated value per order. Repeated line
  totals are never summed. Conflicting populated values fail validation.
- Each supplied raw row contains its recorded line refund. Order refunds
  are the sum of those line amounts, not the first amount or a maximum.
- Net sales equals the order total minus its recorded refunds; voided
  orders retain audit fields but contribute zero. Order totals already
  reflect discounts and include tax/shipping.
- Allocate the order discount in proportion to each line's gross sales.
  Merchandise net sales equals gross line sales minus allocated discount
  minus the recorded line refund; voided lines contribute zero.
- COGS equals unit cost times quantity, reduced by the recorded refund
  as a proportion of gross line sales, with the retained proportion
  floored at zero. Discounts affect revenue, not acquisition cost.
- Gross profit equals merchandise net sales minus COGS. A line margin
  is populated only when its net sales is positive. The server result's
  `financials` includes weighted gross margin calculated as total gross
  profit / total merchandise net sales, plus a count of unverified-cost
  lines. No dashboard visualizations are implemented.
- Keep full calculation precision; round currency only for presentation.
  Comparison tolerances are 0.005 CAD per numeric value and per aggregate
  total, and 1e-10 for margin ratios. No per-line rounding is introduced.
- Date strings preserve source local dates without timezone conversion.

## Known reference limitations requiring reporting context

Recorded line refunds can include tax/shipping. Subtracting them from
merchandise revenue can produce negative line sales, including on fully
refunded orders. This reproduces the supplied references; it is not an
inference of merchandise-only refunds. Changing that model requires an
explicit rule change and updated reference data.

Unmatched/missing SKUs retain raw line names and sales. Product attributes
are blank and unit costs are unknown (`null`, exported as an empty CSV
cell). Reference COGS is zero for these lines, so their calculated gross
profit is unverified; it must not be presented as a confirmed 100% margin.
All six supplied exceptions remain visible and retained.

Guest/unidentified orders are retained. Nonempty customer IDs remain
stable keys even if absent from the customer export; emails are never
used to infer identity. Normal refunds and cancellations are not errors.
The expense sample is not a complete ledger and does not support a
net-profit claim.

## Supplied-data results

- 6,300 order records; 10,203 order lines.
- 81 products; 2,350 customers; 710 expense transactions.
- 18 order-line SKU formatting variants normalized.
- Six missing-SKU exceptions; zero other unmatched SKUs.
- Seven vendor aliases and six expense category aliases standardized.
- 121 voided orders; 331 orders with refunds; 149 guest orders.
- Order-level net sales: CAD 1,452,137.84 (including tax/shipping).
- All six output schemas, row counts, field values, and numeric totals
  reconcile to the supplied references within the stated tolerances.

No source/reference files are altered and no dashboard charts are added.
