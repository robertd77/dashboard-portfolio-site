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

This first increment contains the application shell, a source-file
overview, and clearly labeled placeholders for processing and reporting.
It does not run transformations, render dataset previews, or calculate
dashboard metrics. The original CSVs remain in `data/` and are not
published as public assets. No credentials or external services are
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
