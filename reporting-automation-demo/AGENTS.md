# Reporting Automation Demo

## Purpose

This repository is a portfolio/demo application showing how a
small-business reporting workflow can be automated from raw CSV exports
through validation, transformation, and dashboard reporting.

The fictional client is **Northwood Supply Co.**, an independent Ontario
apparel retailer. Northwood is a simulated business and must always be
presented as such.

## Stack

-   Next.js
-   TypeScript
-   Tailwind CSS
-   shadcn/ui
-   Recharts

## Product principles

-   Keep the demo simple, credible, and easy to understand.
-   This is a portfolio demonstration, not a production SaaS platform.
-   Emphasize workflow automation rather than dashboard development
    alone.
-   Show the progression: raw exports → processing/validation →
    reporting-ready data → dashboard.
-   Prefer straightforward implementations over unnecessary
    abstractions.
-   Do not imply Northwood is a real client.
-   Do not invent additional business rules when the specifications
    already define them.

## Source of truth

Before implementing relevant features, consult: -
`docs/PRODUCT_SPEC.md` - `docs/DATA_SPEC.md` - `docs/DASHBOARD_SPEC.md`

Raw fictional client exports are under `data/raw/`. Expected cleaned
reporting datasets are under `data/clean/`.

## Data requirements

-   Preserve reconciliation with the supplied clean datasets.
-   Do not silently discard data-quality exceptions.
-   Keep order-level and line-item-level measures conceptually separate.
-   Do not treat the expense export as a complete accounting ledger or
    use it to claim GAAP/net profit.

## Engineering

-   Use TypeScript.
-   Keep components reasonably small and reusable.
-   Favor accessible semantic HTML.
-   Maintain responsive layouts.
-   Run lint and type checks after meaningful changes.
-   Avoid adding databases, authentication, external APIs, or background
    infrastructure unless the product specification is intentionally
    expanded.

## Initial implementation approach

Build incrementally. A sensible order is: 1. Application
shell/navigation. 2. Raw-data preview. 3. Processing and validation
experience. 4. KPI layer. 5. Dashboard charts. 6. Northwood case-study
page. 7. Responsive/accessibility polish.
