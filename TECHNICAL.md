# Technical Document — Portfolio Dashboard

## Overview

This document describes key technical challenges and solutions implemented for the Octa Byte AI dynamic portfolio dashboard case study.

## Architecture

The application uses a **Turborepo** monorepo to separate concerns:

1. **`apps/web`** — React SPA that polls the API every 15 seconds and renders tables/charts.
2. **`apps/api`** — Express server that owns portfolio data (SQLite via Sequelize) and aggregates external market data.
3. **`packages/shared`** — Shared TypeScript interfaces for holdings and API responses.

This keeps API keys and scraping logic off the client and allows independent scaling of frontend and backend.

## Challenge 1: No official Yahoo / Google Finance APIs

**Problem:** The case study requires CMP from Yahoo Finance and P/E + earnings from Google Finance, but neither provides a supported public API.

**Solution:**
- **Yahoo Finance:** `yahoo-finance2` v3 (unofficial Node library) with NSE (`.NS`) and BSE (`.BO`) symbol mapping.
- **Google Finance:** Server-side HTTP fetch + Cheerio HTML parsing of quote pages (`SYMBOL:NSE` / `CODE:BOM`).

Both approaches are documented in the README with a user-facing disclaimer.

## Challenge 2: Rate limiting and reliability

**Problem:** Batch Yahoo requests triggered `Too Many Requests` errors. Google scraping is slow and brittle.

**Solutions implemented:**
| Technique | Purpose |
|-----------|---------|
| 15s TTL cache | Matches required refresh interval; reduces duplicate calls |
| 1h stale cache | Serve last good quote when a refresh fails |
| Sequential requests + 350–400ms delay | Avoid burst rate limits |
| Excel-seeded fallbacks | Portfolio remains usable when live fetch fails |
| CMP sanity checks | Reject outliers vs purchase price and seeded reference values |

## Challenge 3: Indian exchange symbol mapping

**Problem:** The Excel mixes NSE tickers (`HDFCBANK`) and BSE numeric codes (`532174`).

**Solution:** Utility functions detect numeric codes and map to `.BO` / `:BOM`; alphabetic codes use `.NS` / `:NSE`.

## Challenge 4: Data model and sector grouping

**Problem:** Holdings must be grouped by sector with rolled-up metrics.

**Solution:**
- Sequelize `holdings` table seeded from `E555815F_58D029050B.xlsx` (26 active positions).
- `portfolioService` computes investment, present value, gain/loss, and portfolio weight server-side.
- Sectors are derived at query time and returned as nested summaries.

## Challenge 5: Real-time UI updates

**Problem:** CMP, present value, and gain/loss must refresh every 15 seconds.

**Solution:**
- Frontend `usePortfolio` hook uses `setInterval(15_000)` + manual refresh button.
- Backend cache TTL aligns with the same interval so refreshes fetch new data without hammering upstream sources on every browser poll.

## Challenge 6: UI requirements

**Solution:**
- **shadcn/ui** primitives (Card, Table, Button, Badge) for a clean financial dashboard.
- **@tanstack/react-table** for the holdings grid with sortable column definitions.
- Sector summary cards and allocation / gain-loss charts for visual analysis.
- Tailwind utility classes for responsive layout and green/red P&L coloring.

## Security

- All external API/scrape calls run on the Express server only.
- No secrets in client bundles.
- CORS restricted to local dev origins.

## Possible improvements

1. Background job queue (BullMQ) for quote refresh decoupled from HTTP request latency.
2. WebSocket push for lower-latency updates after initial load.
3. Full **Bklit UI** pie/bar chart registry components once shadcn registry version alignment is resolved.
4. Deploy API + web to Vercel/Railway with persistent SQLite or Postgres.

## Evaluation alignment

| Criterion | How addressed |
|-----------|----------------|
| Functionality | Full table columns, sector groups, 15s refresh, color-coded P&L |
| Code quality | Typed monorepo, separated services, shared types |
| Performance | Caching, throttling, memoized table columns |
| Error handling | Graceful fallbacks, API error messages, health endpoint |
| API strategy | Unofficial libs + scrape + cache + validation documented |
| UI | shadcn + responsive dashboard with summary cards and charts |
