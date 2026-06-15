# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

An interactive 3D museum of video game history that runs in the browser: an infinite-canvas
GSAP timeline, Three.js era galleries, and a Wikipedia-enriched data pipeline. Vite + React 18
+ TypeScript + Three.js + GSAP frontend; Vercel serverless functions + Neon Postgres backend.

## Commands

```bash
npm run dev          # Vite dev server → http://localhost:5173 (catalog mode unless DB configured, see below)
npm run build        # tsc --noEmit && vite build
npm run typecheck    # tsc --noEmit over src + api + shared
npm run preview      # serve the production bundle
vercel dev           # full stack locally: runs /api functions + frontend together
```

There is **no test suite and no linter** — `typecheck` + `build` are the only verification gates.

## Architecture

### Catalog is the source of truth; the DB is a cache

`shared/catalog/` (`eras.ts`, `consoles.ts`, `games.ts`, `index.ts`) is the curated dataset and
the single source of truth. It is imported by **both** the client and the serverless handlers,
which makes the data flow a fallback chain that can never reach a broken state:

- `GET /api/museum` serves Neon DB rows (`museum_items` + `item_metrics`) when available, else
  falls back to `catalogData()` (`api/museum.ts`).
- The client (`src/api/client.ts`) calls `/api/museum`; on any failure/timeout it falls back to
  `catalogData()` again. `data.source` (`'database'` | `'catalog'`) drives the masthead badge.

The DB is populated **from** the catalog by two idempotent endpoints — it holds nothing the
catalog doesn't already define:

- `POST /api/seed` — harvests Wikipedia summaries + license-checked Wikimedia images, upserts
  `museum_items` (`api/seed.ts`, `api/_lib/wikipedia.ts`).
- `POST /api/enrich-metrics` — parses hardware metrics out of catalog `specs` strings (and
  gap-fills from Wikidata), upserts `item_metrics` (`api/enrich-metrics.ts`, `api/_lib/metrics.ts`).
  COALESCE upsert: a non-null new value overwrites; nulls never clobber.

All three layers share the types in `shared/types.ts` (`MuseumData`, `MuseumItem`, `ItemMetrics`).

### Frontend

`src/App.tsx` is the orchestrator: it holds the view state (a `timeline` ↔ `gallery` union),
toggles every overlay, owns the single `MusicEngine` (`src/audio/ambience.ts`) and `SfxEngine`
(`src/audio/sfx.ts`) instances, and runs the GSAP "era doorway" transition. Major surfaces:

- `src/timeline/` — infinite-canvas timeline (imperative transforms + GSAP camera, `layout.ts`
  computes era/console/game positions).
- `src/gallery/` — Three.js first-person engine (`GalleryApp.ts`) + 6 room themes (`themes.ts`)
  + procedural textures (`textures.ts`).
- `src/placard/`, `src/search/`, `src/quiz/`, `src/data/` (Data & Stats overlay), `src/credits/` — overlays.
- `src/art/` — deterministic procedural placeholder art, used when an item has no free image.

### Image & naming guardrails

Most game box art on Wikipedia is non-free, so the harvester checks Commons licensing, walks an
article's other images for a free alternative, and otherwise flags the item for procedural
placeholder art (`imageStatus`) — there is no broken-image state. Regional aliases (Genesis/Mega
Drive, NES/Famicom, TurboGrafx-16/PC Engine) are deduped via `ALIAS_TO_SLUG` / `resolveAlias` so
regional names never produce duplicate rows.

## Gotchas

- **Plain `npm run dev` runs in catalog mode** (no images/metrics). To get DB data locally you need
  both a `.env.local` with `DATABASE_URL` (gitignored — never commit) **and** the
  `vite-plugins/api-dev.ts` plugin, which serves `/api/*` by loading the real Vercel handlers via
  `ssrLoadModule`. That plugin has a **hardcoded route allowlist** (`/api/museum`, `/api/seed`,
  `/api/enrich-metrics`) — any new endpoint must be added there or it 404s locally, and the
  allowlist only re-reads on server restart.
- **After editing catalog `specs` or the metric parsers:** restart the dev server (so
  `ssrLoadModule` picks up the new code) and re-run `POST /api/enrich-metrics`. Live data won't
  change until you do.
- **Metric parser strings must start with the number.** `parseUnitsSold`/`parsePriceUsd` regexes
  are anchored (`^`) and only strip a leading `~`. `'6.5+ million'` parses; `'over 6.5 million'`
  parses to `undefined`. Parenthetical context *after* the number is fine (becomes the hover label).
- **Swapping gallery music is a file swap, no code change:** overwrite `public/music/<GalleryTheme>.mp3`
  (filename = theme value: `lobby`/`arcade`/`eightbit`/`sixteenbit`/`threed`/`hd`/`modern`). Update
  `public/music/ATTRIBUTIONS.md`. All audio is CC-BY (music) / CC0 (sfx).
- **Desktop-only by design.** `src/DesktopGate.tsx` blocks the app on coarse pointer / no-hover /
  width < 900px. (The README's "Touch support" line is stale.)
- Neon auto-suspends when idle; the first `/api/museum` hit on a cold DB can fall back to catalog
  until it warms — `api/_lib/db.ts` `withColdStartRetry` wraps queries for this.
