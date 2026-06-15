# Modern Era → Current Year (auto-advancing + content seed)

**Date:** 2026-06-15
**Branch:** expansions
**Status:** Approved, in implementation

## Problem

The timeline's "Modern Era" (`shared/catalog/eras.ts`) is hardcoded `years: [2012, 2026]`.
Two root causes make it "feel too short":

1. **Stale frame.** The end year `2026` is a literal. In 2027+ the hall freezes and
   silently goes stale — it never reaches "now" on its own.
2. **Dead live edge.** Newest curated content is **Steam Deck (2022)** and
   **Baldur's Gate 3 (2023)**. The era block runs to 2026, so the ~2023→2026
   stretch (~480px at `YEAR_W=160`) is empty. The most recent ~3 years have nothing.

The block is *not* literally short — at 14 years / 2400px it is the joint-widest hall
with 14 items. The issue is the unfilled, frozen right edge.

## How the system works (verified)

- Timeline is fully data-driven: `xOfYear(y) = (y - 1960) * 160px`
  (`src/timeline/layout.ts`). Era block width, world width (`xOfYear(maxYear + 3)`),
  ruler ticks, gallery labels, and the `{years[0]} — {years[1]}` header all derive
  from each era's `years` tuple. No downstream magic numbers.
- `2026` is hardcoded in **exactly one place**: `shared/catalog/eras.ts:87`.
- `api/museum.ts:42` returns `eras: ERAS` (the in-code constant) on **both** the
  `database` and `catalog` source paths — only *items* come from Postgres. So a
  computed end-year propagates everywhere with no DB seeding concerns.
- Seeding is catalog-driven: `POST /api/seed` walks `ALL_ITEMS`, calls
  `harvestItem()` (Wikipedia) per entry, upserts image + extract into Postgres.
  Curated `summary`/`legacy` survive when Wikipedia returns nothing.
  `POST /api/enrich-metrics` then fills units/price/cpu/ram.

## Decision

**Approach A — Extend the existing Modern Era. Do NOT split off a new hall.**

Rejected: a new post-2023 era. Post-2023 yields only ~3–4 real items today, so a new
hall would be thin and empty — the exact "too short" complaint, relocated. The newest
generation (x86, hybrids, SSD, live-service, handheld PCs) is thematically continuous
with Modern. Split later only when a genuine thematic break (cloud-native / streaming
gen) has enough titles to fill a room.

## Design

### 1. Auto-advancing end year

In `shared/catalog/eras.ts`, replace the literal `2026`:

```ts
// Modern Era has no fixed end — it runs to "now". Floor at 2026 so a wrong
// client/server clock can never shrink the hall below its curated baseline.
const MODERN_ERA_END = Math.max(2026, new Date().getFullYear());
```

…and the `modern-era` entry uses `years: [2012, MODERN_ERA_END]`.

- Evaluated server-side in `api/museum.ts` (per cold start — far more often than
  yearly) and client-side on the catalog fallback (per page load). Both stay fresh
  with **no redeploy** needed for the year to advance.
- `Math.max(2026, …)` guards against a bad clock regressing the hall.

### 2. Content seed (fills 2023 → now)

Append verified items to `shared/catalog/consoles.ts` and `shared/catalog/games.ts`,
mirroring the existing entry shape
(`slug, kind, era:'modern-era', name, wikiTitle, aliases, year, [yearEnd], maker,
[platform], specs, summary, legacy`). Enrichment fields auto-populate via the pipeline.

**Final: 4 new items** (5 attempted; see PS5 Pro note). Every release fact verified
against Wikipedia before insertion.

- **Hardware** (ongoing → no `yearEnd`): Nintendo Switch 2 (2025, Nintendo).
- **Games**: Astro Bot (2024, TGA 2024 GOTY), Final Fantasy VII Rebirth (2024),
  Clair Obscur: Expedition 33 (2025, TGA 2025 GOTY). All `platform: 'playstation-5'`.

**PlayStation 5 Pro — dropped.** Its `wikiTitle` redirects to the base "PlayStation 5"
article (confirmed live: `resolvedTitle` = "PlayStation 5"). `api/seed.ts`'s
canonical-title dedup (lines 74–86) correctly skips a second entry resolving to an
already-seeded article, so it never gets a DB row, and forcing it in would duplicate
the base PS5's image + extract. No distinct Wikipedia entity exists → not a clean
museum piece. Re-add later only if it gets a standalone article or a curated local
image. The remaining 4 items already reach the 2025 live edge.

**Workflow after append:** `POST /api/seed` (images + extracts) →
`POST /api/enrich-metrics` (units/price/specs). Seed is idempotent; transient Neon
cold-start `fetch failed` on a couple of items clears on a re-run.

### 3. Scope boundary (YAGNI)

- **In scope:** auto-advancing year frame (truly automatic); curated recent-item seed
  (the "expanding" payload).
- **Out of scope:** an automated new-release crawler. A live feed risks unverified data
  into a curated museum, and adding a game is a ~15-line catalog append. Revisit only
  if hands-off ingestion is ever wanted.

## Success criteria

1. `npm run typecheck` and `npm run build` pass.
2. Timeline right edge / Modern Era header reads the current year (2026 now;
   advances automatically thereafter).
3. New items render in the Modern Era lane with resolved Wikipedia images after seed.
4. No regression in other eras' layout.

## Constraints

- All code edits performed by Sonnet (per user instruction).
- No git commits without explicit user request (per user CLAUDE.md).
- Data from free sources (Wikipedia), DB-cached — per project data rules.
