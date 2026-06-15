# Museum Expansions — Design Spec

**Date:** 2026-06-14
**Branch:** `expansions` (off `main`; no merge to `main` without explicit user OK)
**Scope:** 3 features. (A 4th — share/deep-links — was considered and **dropped**: it was only a show-off convenience for a desktop-only personal showcase, needed a router + Vercel rewrite config, and the user does not need sharing.)

## Standing constraints

- **Coding by Sonnet subagents only.**
- **Free data sources**; persist anything fetched to the shared Neon Postgres DB (fetch once, reuse cached rows).
- **Never fabricate data.** If a value can't be sourced, show a gap, not a guess.
- Each feature **verified working** on the live local app (`localhost:5173`) + `tsc --noEmit` before being called done.
- Existing zoom-perf fix must not regress (data-viz lane hidden at far overview LOD).

## Context (current code, mapped)

- Vite + React 18 + TS + Three.js + GSAP. Desktop-only. No router. No test runner.
- `MuseumItem.specs` is `Record<string,string>` — already holds free-text `"Units sold"`, `"Launch price"`, CPU (`"MOS 6507 @ 1.19 MHz"`), RAM (`"128 bytes"`) for many consoles.
- 36 consoles + 41 games = 77 items; 6 eras. `xOfYear(y) = (y-1960)*160` is the timeline's time→x map. LOD thresholds: 0.16 (eras→consoles), 0.52 (consoles→games).
- DB table `museum_items` + idempotent `POST /api/seed` (Wikipedia harvest). Vite dev serves `/api/*` via `vite-plugins/api-dev.ts` SSR-loading the Vercel handlers; `.env.local` provides `DATABASE_URL`.
- `MusicEngine` (`src/audio/ambience.ts`) owns crossfading per-era music + mute state. No SFX yet.
- App overlays (Placard / Search / Credits) share one pattern: fixed backdrop, click-to-close, `stopPropagation` card, GSAP entrance, Escape handler.

---

## Feature 1 — Data-viz lane (DB-backed)

### Data pipeline (free + cached)
- New Neon table:
  ```sql
  CREATE TABLE item_metrics (
    slug TEXT PRIMARY KEY REFERENCES museum_items(slug) ON DELETE CASCADE,
    units_sold BIGINT,            -- normalized number (e.g. 155000000)
    units_sold_label TEXT,        -- human label preserved (e.g. "~155 million")
    launch_price_usd NUMERIC,     -- normalized USD
    cpu_mhz NUMERIC,              -- parsed clock in MHz
    ram_bytes BIGINT,             -- parsed RAM in bytes
    source_url TEXT,              -- citation for fetched values
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  ```
- New idempotent step `POST /api/enrich-metrics` (mirrors `/api/seed`):
  1. For each item, **parse what already exists in `specs`** (`Units sold`, `Launch price`, CPU MHz, RAM) → normalize to numbers. This is the "already in DB" path.
  2. **Only for items still missing `units_sold`/`launch_price`**, fetch from a **free source** — Wikidata REST/SPARQL (e.g. P1092 quantity produced, P2284/price props) with a Wikipedia-infobox parse fallback — and write the value + `source_url`.
  3. Re-running only fills gaps (idempotent). Never overwrites a sourced value with a guess.
- `/api/museum` left-joins `item_metrics` and returns a `metrics?` object per item (additive; catalog fallback still works with metrics absent).

### Render
- A parallel **lane beneath the timeline world**, aligned to the same `xOfYear` axis.
- Two togglable modes:
  - **Units sold** — bar per console at its launch year (height ∝ normalized units; label shows preserved text).
  - **Hardware growth** — CPU-MHz and RAM lines on a log scale across the years.
- Visible only at consoles/games LOD (`s ≥ 0.16`); hidden at far overview to protect zoom perf.
- A small toggle control (Units ↔ Hardware ↔ Off). Footnote links `source_url` for fetched values.
- Honest gaps: consoles without a sourced number render no bar (with a muted "no data" tick), never a fabricated one.

### Verify
- After `enrich-metrics`, query DB: confirm rows written, spot-check a known value (PS2 ≈ 155M, Wii ≈ 101M). Confirm lane renders those bars at the right x. `tsc` clean. Live screenshot at games LOD.

---

## Feature 2 — Guided tour + sound FX

### Tour
- Masthead **▶ Tour** button → auto-sequence using the existing camera API:
  `frameWorld()` → `frameEra(eraBlock)` for each era in chronological order, ~5s dwell each.
- Caption card overlay (era name + tagline + one fact) synced to each step, GSAP fade.
- Timeline-level only (no gallery dives) → reliable, no Three.js timing coupling.
- Skippable: Esc, click anywhere, or a Stop button. Restores normal interaction on end.

### Sound FX
- New `SfxEngine` (`src/audio/sfx.ts`), separate from `MusicEngine` but reads the same mute state.
- One-shot cues: card click (coin-insert), era enter (power-on chime), tour step advance, quiz correct / wrong.
- Files in `public/sfx/`; prefer CC0/CC-BY. Any non-free cue is cited in the Credits modal + `public/sfx/ATTRIBUTIONS.md` (mirrors `public/music/ATTRIBUTIONS.md`).
- Plays at fixed volume via short-lived `Audio` elements; no crossfade; no-op when muted.

### Verify
- Tour: live run — camera pans era→era, caption cards appear/advance, Esc stops cleanly. `tsc` clean.
- SFX: confirm files load (network 200), cues fire on the right events, muted state silences them, no console errors. (Audio can't be heard in headless verify — assert wiring + element creation + no errors.)

---

## Feature 3 — Trivia / quiz

- Masthead **Quiz** button → modal reusing the Credits/Search overlay pattern (backdrop, GSAP entrance, Escape close).
- Generator builds **~10 MC questions** from catalog facts:
  - release year of an item,
  - maker of an item,
  - which era an item belongs to,
  - "which launched first?" (compare two items' years),
  - a spec lookup (e.g. CPU/RAM/units).
- Each question: stem + 4 options (1 correct + 3 distractors sampled from the **same kind/era** so they're plausible, de-duplicated).
- Tracks score + progress (e.g. "Q3 / 10"). End screen: final score + per-question review (your answer vs correct, link to that item's placard). Replay reshuffles with fresh questions.
- SFX on correct / wrong. Fully client-side (no new data, no DB).

### Verify
- Live run: answer through a full 10-question round, confirm scoring increments correctly, end screen shows score + review, replay produces new questions, placard links work. `tsc` clean. Screenshot.

---

## Build order & integration

1. **Branch + scaffolding** (done: branch `expansions`).
2. **Feature 3 (quiz)** — self-contained, no data deps; lowest risk, gives a quick verified win.
3. **Feature 2 (tour + SFX)** — `SfxEngine` first (quiz can adopt it after), then tour. Source SFX assets.
4. **Feature 1 (data-viz)** — DB table + `enrich-metrics` + `/api/museum` join + lane render. Highest risk; do last with full verification.
5. Masthead grows three buttons (Quiz, ▶ Tour, data-viz toggle) beside existing Search / Credits.
6. Credits modal + `ATTRIBUTIONS.md` updated for any non-free SFX.

Each feature is independently verified and independently revertable (the whole branch is throwaway-able).

## Out of scope

- Share / deep links (dropped).
- Merging to `main`.
- Mobile/touch (app is desktop-only by design).
- Any fabricated or non-free data without citation.
