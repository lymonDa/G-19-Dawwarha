# Dawwarha SEO Performance Report

## Evidence date

2026-09-19.

## Build evidence

- `cd frontend && npm run build`: PASS.
- Angular production build completed successfully.
- Initial raw bundle: 421.43 kB; estimated transfer: 111.10 kB.
- Lazy route chunks are emitted, confirming route-level code splitting.

## Core Web Vitals

- LCP: NOT MEASURED. No Lighthouse or browser performance capture was available in this run.
- INP: NOT MEASURED.
- CLS: NOT MEASURED.
- TTFB: NOT MEASURED.

## Findings

- Angular is configured as client-side rendering only; no SSR or prerender configuration was found.
- Public route metadata is applied after navigation in the browser. Raw production HTML therefore cannot provide route-specific rendered content or metadata.
- Production budgets exist for initial JavaScript and component styles.
- Google Fonts are loaded from a third party in `src/index.html`; real-world font timing was not measured.

## Status

WARNING: Performance and Core Web Vitals require a deployed URL or local browser/Lighthouse run for valid measurements. No fabricated scores are reported.
