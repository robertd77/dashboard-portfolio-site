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
Processing and dashboard reporting remain clearly labeled placeholders.
It does not run transformations or calculate dashboard metrics. The
original CSVs remain in `data/`; allowlisted download routes serve them
without copying them into public assets. No credentials or external services are
required. The UI uses TypeScript, Tailwind CSS, and shadcn/ui-style local
components; Recharts can be added when the chart implementation begins.

Validation and production startup:

```sh
npm run lint
npm run typecheck
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
