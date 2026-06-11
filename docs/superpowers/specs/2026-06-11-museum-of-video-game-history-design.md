# Museum of Video Game History — Design

**Date:** 2026-06-11
**Status:** Approved by user spec (autonomous session — user provided exhaustive requirements up front; brainstorm Q&A gates skipped, decisions recorded here instead).

## Purpose

Browser-based interactive 3D museum of ~55 years of video game history. Immersive visual
alternative to wiki rabbit holes: infinite-canvas timeline → museum placards → 3D era galleries.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Vite + React 18 + TypeScript | Fast, deploys to Vercel out of the box; spec asks for `/api` directory functions, which pairs with a static Vite frontend (Next.js would route through its own conventions) |
| Animation | GSAP 3 | Spec requirement; camera tweens, placard entrances, view transitions |
| 3D | Three.js (vanilla, no react-three-fiber) | Full control over lighting/tone-mapping quality bar; one dependency fewer |
| API | Vercel Serverless Functions in `/api` | Spec requirement; `vercel deploy` works untouched |
| DB | Neon PostgreSQL via `@neondatabase/serverless` | Spec requirement; HTTP driver suits serverless |
| Data source | Wikipedia REST + Action APIs, Wikimedia Commons | Spec requirement |

## Architecture

```
shared/catalog/      Curated source of truth: eras, consoles, games
                     (slugs, aliases, wiki titles, specs, summaries, legacy text)
api/_lib/            db.ts (schema+client), wikipedia.ts (harvest+license check)
api/museum.ts        GET  → eras+items from DB; falls back to shared catalog if DB empty/absent
api/seed.ts          POST → harvest Wikipedia per catalog entry, upsert into Neon
src/timeline/        Infinite canvas (DOM transform + GSAP), 3 LOD levels: eras → consoles → games
src/placard/         Era-styled museum placard overlay
src/gallery/         Three.js era galleries: themes, procedural textures, rail navigation, inspect
src/art/             Procedural era-styled placeholder art (canvas) — shared by DOM + WebGL
```

**Data flow:** frontend calls `/api/museum` only. Server reads Neon; if unseeded/unconfigured,
serves the curated catalog directly. If the API itself is unreachable (e.g., bare `vite dev`),
the client imports the same `shared/catalog` as embedded fallback. The app is never broken and
the frontend never touches Wikipedia or the DB directly.

## Key decisions

1. **Curated catalog + Wikipedia enrichment** (not pure live harvest). Wikipedia infobox
   wikitext parsing is too brittle to be the only source for specs. Curated baseline specs +
   legacy/impact essays; seeding overlays live Wikipedia extracts, canonical resolved titles,
   and license-checked imagery. Robustness > novelty.
2. **Naming dedup**: every entry carries `aliases` ("Sega Mega Drive" → `sega-genesis`).
   Harvester follows Wikipedia redirects, resolves to canonical title, upserts by slug —
   two aliases can never create two rows. Disambiguation pages (`type: "disambiguation"` in
   REST summary) trigger a suffix variant ladder: `"X (video game)"`, `"X (console)"`, etc.
3. **Image guardrails**: lead image license checked via Commons `imageinfo.extmetadata`.
   Non-free (most game box art is fair-use) → try other images on the article (filtered,
   max 6 license lookups) → else `image_status: "placeholder"` and the client renders
   deterministic procedural era-styled art (seeded by slug). No broken images ever.
4. **Timeline LOD**: world = year→x mapping; zoom scale buckets switch era-blocks →
   console lifespan bars → game cards. Era blocks sit on three collision-free lanes so
   generational overlap (SNES vs Genesis before PlayStation; Game Boy outliving the 16-bit
   war) is visually literal without blocks occluding each other.
5. **Galleries**: one `GalleryApp` engine + six theme configs (lighting rig, fog, procedural
   floor/wall textures, props). ACES filmic tone mapping, PCF soft shadows, capped light
   counts. Navigation: ←/→ moves along hall rail, mouse pans yaw/pitch. Click display →
   GSAP camera tween → HTML inspection overlay.

## Eras

| Era | Span | Gallery mood |
|---|---|---|
| The Arcade Age | 1962–1985 | Black room, neon magenta/cyan, cabinet silhouettes |
| 8-Bit Home Console Era | 1983–1996 | Warm living room: wood floor, cream wallpaper, CRT glow |
| 16-Bit Console Wars | 1988–1996 | 90s den: patterned carpet, purple/teal accents |
| The 3D Revolution | 1993–2004 | Early-polygon eeriness: checkerboard, fog, flickering fluorescent |
| The HD Generation | 2004–2013 | Glossy dark floor, cool blue-white spots |
| The Modern Era | 2012–present | Bright electronics showroom: white gloss, emissive ceiling panels |

35 consoles + 36 defining games (Spacewar! 1962 → Baldur's Gate 3 2023), including
handhelds, famous failures (Virtual Boy, Jaguar, Wii U), and PC/mobile milestones.

## Error handling

- Every Wikipedia fetch: 8s timeout, descriptive UA, per-entry try/catch — one failure never
  aborts the seed; report lists failures.
- DB missing/unreachable → API serves catalog; API unreachable → client serves catalog.
- Texture load error in gallery → procedural placeholder texture swap.
- Placard/gallery always render from curated fields even when enrichment absent.

## Testing / verification

- `tsc --noEmit` over src + api + shared.
- `vite build` production bundle.
- Manual smoke: timeline pan/zoom/LOD, placard open, gallery enter/navigate/inspect for
  every era theme.
