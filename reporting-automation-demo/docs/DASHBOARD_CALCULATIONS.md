# Dashboard chart calculations

Northwood Supply Co. is fictional; all reporting data is simulated.

All four charts consume the reconciled, newly generated reporting datasets
from Task 3 through the compact dashboard projection. Reference exports
are used for reconciliation and tests, never as chart inputs. No source
files are changed. Shared month/channel filters retain separate order and
line-item grains. Inventory remains an unfiltered master dimension.

## Category performance

Revenue and profit sum processed line values. Margin is aggregate profit
divided by aggregate merchandise net sales. Revenue shares use **all**
selected merchandise sales, including unmapped lines. The five category
bars are ranked by revenue. Unknown categories remain in an explicit
unmapped bucket in the figures table and a visible exception note.
For the supplied year, six missing-SKU lines account for CAD 680.96 of
unmapped revenue and provisional profit; this reproduces Task 3's
zero-cost convention. Category totals plus that bucket reconcile to the
filtered merchandise totals and Gross Profit KPI.

## Product and stock coverage

Products are ranked by selected merchandise revenue, aggregating all SKU
variants with the same product name into a product style. Show the top
eight styles. Inventory sums each master SKU once across those variants;
joining inventory onto transaction rows would overcount it. Missing or
unmatched SKUs remain in reporting totals and an exclusion note, without
inventing an inventory match.

Velocity uses the three calendar months ending at the selected end month,
including months preceding the selected start month. It respects the
selected channel. The early-year window is shortened to the available
dataset months, with its actual length displayed. Zero-sales months in
that window still count. Stock coverage equals current inventory divided
by average monthly units in the window. No recent units means unavailable
coverage, not an infinite or fabricated estimate.

Units use the processed quantities of non-voided lines. Refunded lines
retain their recorded quantities: refund amounts do not establish how
many physical units were returned. These quantities are not net returned
units. Current stock is a shared snapshot, not historical or allocated
inventory for Online/POS. A channel-specific view is therefore a coverage
scenario for that channel's velocity. Coverage is an estimate, not a
forecast. Amber flags **under two months** for review, an illustrative
demo threshold rather than a service-level or replenishment policy.

At default settings, Insulated Jacket leads with CAD 167,345.74 revenue,
122 units in stock and 321 recorded non-voided units during October–December:
122 / (321 / 3) = approximately 1.14 months of stock.

## Customer purchase mix

Classify each distinct order from the full available history before
applying month or channel filters. Sort by source-local order timestamp,
then order ID for deterministic handling of identical timestamps. For
each nonempty Customer ID, the first recorded order is first purchase;
later orders are repeat. Voided and refunded orders stay in the history,
consistent with the distinct-order KPI. IDs need not occur in the customer
master; emails are never identity keys. Empty IDs stay guest/unidentified.

Monthly stacks use order-level net sales, including tax and shipping.
Tooltip shares use total monthly sales including guests; the headline
repeat share explicitly uses identified-customer sales (first + repeat).
First + repeat + guest amounts and counts reconcile to Net Sales and
Orders. Nonpositive headline denominators return unavailable ratios.
Excluded months are gaps, consistent with the monthly sales chart.
This describes within-dataset purchase history, not lifetime retention.

## Verification

Pure selector tests cover weighted margins, missing categories/SKUs,
inventory aggregation, trailing windows, zero velocity, date/channel
selection, chronological customer classification, timestamp ties, guest
orders, voided history, and empty results. Actual-data tests independently
calculate the metrics from reference CSVs for all twelve months, Q4, and
the full year across All / Online / POS. The existing KPI, monthly chart,
transformation, and reconciliation tests remain in the suite.
