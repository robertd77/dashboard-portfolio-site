# Reporting Automation Consulting Demo

A portfolio demonstration of a small-business reporting automation
workflow using a fictional apparel retailer, **Northwood Supply Co.**

The demo is intended to show the full path from ordinary business
exports to validated, reporting-ready data and a concise management
dashboard.

## Repository handoff contents

-   `AGENTS.md` --- implementation guidance for Codex/agents.
-   `docs/PRODUCT_SPEC.md` --- product, UX, scope, and case-study
    requirements.
-   `docs/DATA_SPEC.md` --- source schemas, transformations, metric
    definitions, and reconciliation rules.
-   `docs/DASHBOARD_SPEC.md` --- KPI and four-chart dashboard
    requirements.
-   `data/raw/` --- fictional client-provided exports.
-   `data/clean/` --- reference transformed reporting datasets and
    exception log.

## Suggested first Codex task

Read `AGENTS.md` and all files under `docs/`. Inspect but do not modify
the datasets under `data/`.

Set up the initial Next.js application structure for the Northwood
reporting automation demo. Implement the basic application shell and
navigation for:

**Raw Data → Process & Validate → Dashboard**

Do not implement the full dashboard or processing workflow yet. Keep the
implementation consistent with the specifications and report any
conflicts or ambiguities before making assumptions.

## Important

Northwood Supply Co. is entirely fictional and the included data is
simulated.

## Local development

The Next.js App Router application lives in this folder. Use Node.js
20.9 or later (the initial implementation was verified with Node.js 24).
Run all commands from `reporting-automation-demo/`:

```sh
npm ci
npm run dev
```

The home route redirects to `/raw-data`. The workflow navigation links
to `/raw-data`, `/process`, and `/dashboard`. All three routes are
available directly and share the application header, navigation, and
fictional-data disclosure.

The application includes the shell, a source-file overview with row
counts, selectable raw-data previews, and downloads of the original CSVs.
Process & Validate runs real deterministic transformations and compares
generated results with the supplied references. The dashboard includes
five KPIs and an interactive monthly sales chart; three charts remain
planned for later tasks. The
original CSVs remain in `data/`; allowlisted download routes serve them
without copying them into public assets. No credentials or external services are
required. The UI uses TypeScript, Tailwind CSS, and shadcn/ui-style local
components, shadcn/ui chart primitives, and Recharts.

Validation and production startup:

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

If the environment's default npm cache is not writable, use
`npm --cache /tmp/northwood-npm-cache ci` for installation.

## Raw Data previews

`src/lib/datasets.ts` defines the four source descriptions and filenames.
The server-only `src/lib/csv.ts` loader uses `csv-parse` to read CSV syntax
correctly, including quoted commas, escaped quotes, and embedded newlines.
It preserves source headers and values as strings without trimming,
casting, normalization, or repairs.

`src/lib/raw-data.ts` counts all records (excluding the header) and sends
only the first 20 rows per file to the interactive preview. Orders are
selected initially. All original columns are available in a horizontally
scrollable, keyboard-focusable table; no records are sorted or filtered.
The source overview and samples are generated at build time, so rebuild
after any intentional future dataset replacement to refresh the previews.

`/raw-data/[dataset]/download` accepts only known catalog IDs and returns
the complete original file bytes as a CSV attachment. Filesystem reads
run on the server, and the route's file tracing includes the source CSVs
for deployments that package server functions. No datasets are modified.

## Processing and validation

On `/process`, **Run Reporting Workflow** calls `POST /api/process`.
`src/lib/processing/workflow.ts` loads and checks all four raw schemas,
calls the pure TypeScript transformation module, and then compares all
six generated datasets against the reference files. The response includes
real counts, exceptions, and reconciliation results; complete reporting
records stay on the server. The UI handles pending, failed, mismatched,
and successfully reconciled states separately.

The interface presents four stages at approximately five seconds each
after real processing returns, making the guided run roughly 20 seconds.
The pacing is explicitly labeled as illustrative. Only calculated results
are shown, and failures never advance to a false completion. Leaving the
page cancels the presentation and its pending request/timers. API calls
and generated downloads do not incur the demonstration delay.

The dashboard calls `runReportingWorkflow()` and consumes its generated
`datasets` without duplicating transformations. Each run is
stateless: no CSV writes, database, or cross-user session state. A page
refresh starts a new view; generated downloads recompute deterministic
outputs using the same entry point. Source and reference files are
included in server route file tracing.

Read [Processing conventions and reconciliation](docs/PROCESSING_NOTES.md)
for financial assumptions and known reference limitations. `npm test`
runs business-rule and whole-dataset reconciliation tests using Node's
test runner and `tsx`.

## Dashboard KPI layer

`/dashboard` displays Net Sales, Orders, Average Order Value, Gross Profit,
and Gross Margin. Its inclusive month range defaults to January–December
2025, with All / Online / POS channel selection. Changing a month beyond
the other boundary moves both boundaries to that month.

`src/lib/dashboard/data.ts` projects reconciled processing results into
compact order and line records at build time. Reference CSVs are used
only for reconciliation, never as the dashboard's reporting source.
Rebuild after intentional future input changes to refresh the dashboard.
Visiting it directly does not require a previous guided processing run.

Pure selectors in `src/lib/dashboard/selectors.ts` filter both grains
consistently. Order net sales and AOV use distinct orders; gross profit
and weighted margin use merchandise lines. Empty totals display zero
with unavailable ratios shown as an em dash. A filter-aware notice keeps
missing product costs visible and profit/margin provisional.

`DashboardProvider` and `useDashboard()` expose filters, original and
filtered reporting records, and calculated KPIs for Task 5 charts.
Extend the compact projection with the required product/customer fields
when those charts are implemented; keep the same processing and filtering
foundation. Three chart placeholders reserve space for later tasks.
Tests compare all five metrics independently with the
reference CSVs for every month/channel and verify empty selections,
distinct order counts, weighted margin, and month boundary behavior.

## Monthly sales chart

The Recharts area chart uses `ChartContainer`, `ChartTooltip`, and
`ChartTooltipContent` from the local shadcn/ui chart primitives. Shared
reporting card, tooltip metric rows, chart theme, and compact currency
formatters establish the visual foundation for the remaining charts.

`selectMonthlySales()` groups the already-filtered order records using
the existing KPI calculator. All 12 months remain on the 2025 timeline;
excluded months are null gaps, while included months with no orders are
zero totals with unavailable AOV. The chart and table never read raw or
reference CSVs directly. Hover, touch, and keyboard tooltips show monthly
Net Sales, distinct Orders, and AOV; an expandable monthly table provides
the same figures without relying on the visualization.

Q4 has a subtle amber background with November/December markers. Peak
month, selected Q4 sales, and its share are computed from the current
selection; partial selections do not claim full-year comparisons.
Zero-sales selections avoid undefined percentages. Tooltip motion
respects reduced-motion preferences. Tests reconcile monthly points and
their totals against the existing KPIs and reference order exports for
all month/channel combinations.

Recharts and its React-version-matched `react-is` peer are now dependencies.
After pulling this change, run `npm ci`
before `npm run dev`.
