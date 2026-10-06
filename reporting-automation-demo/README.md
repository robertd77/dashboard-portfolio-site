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
