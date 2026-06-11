# 🕹️ The Museum of Video Game History

**Live:** https://video-games-history-ssobii2s-projects.vercel.app

An interactive 3D museum of ~60 years of video game history that runs entirely in the
browser — an immersive alternative to wiki rabbit holes.

- **Infinite canvas timeline** (GSAP): six color-coded, overlapping eras from Spacewar! (1962)
  to the modern generation. Zoom from era blocks into console lifespan bars into game cards.
- **Museum placards**: era-styled spec sheets with curated history, legacy essays, and a
  gallery call-to-action.
- **3D era galleries** (Three.js): six themed first-person rooms — neon arcade, 8-bit living
  room, 16-bit den, fog-and-checkerboard 3D revolution, HD showroom, modern flagship store.
  Walk with ←/→ (or on-screen buttons), look with the mouse, click any display to glide into
  an inspection view. Each room plays its own synthesized ambience (mute toggle in the HUD).
- **Search** (Ctrl/⌘+K): finds consoles and games by name, regional alias ("mega drive",
  "famicom"), or maker, and opens their placards.
- **Touch support**: pinch-zoom and drag on the timeline, on-screen walk buttons in galleries.
- **Wikipedia data pipeline** (Vercel serverless + Neon Postgres): server-side harvesting of
  article summaries and **license-checked** Wikimedia imagery, with regional-naming dedup
  (Genesis/Mega Drive, NES/Famicom, TurboGrafx-16/PC Engine) and disambiguation handling.

## Run it locally (zero config)

```bash
npm install
npm run dev          # → http://localhost:5173
```

That's it. Without a database the app serves its **embedded curated catalog** (71 items,
full specs and history) — every feature works: timeline, placards, all six galleries.

### Optional: full pipeline locally

```bash
npm i -g vercel
vercel dev           # runs /api functions + frontend together
```

## Deploy to Vercel (free tier)

```bash
vercel deploy        # works out of the box, no env vars required
```

### Optional: enable the Wikipedia-enriched database

1. Add a **Neon Postgres** database (Vercel Dashboard → Storage → Neon, free tier) —
   this auto-sets `DATABASE_URL`.
2. (Optional) set `SEED_TOKEN=<secret>` to protect the seeding endpoint.
3. Seed it:

   ```bash
   curl -X POST "https://<your-app>.vercel.app/api/seed?token=<secret>"
   ```

   The seeding report lists per-item results: free images found, placeholders used,
   redirects deduplicated, failures (if any).

The frontend automatically shows “⛁ Wikipedia-enriched archive” once `/api/museum`
serves database rows. Re-running the seed refreshes summaries and imagery in place.

## Architecture

```
shared/catalog/   Curated source of truth (eras, consoles, games, aliases, specs, legacy)
api/_lib/         Neon client + Wikipedia/Commons harvester (license guardrails)
api/museum.ts     GET — data endpoint (DB → catalog fallback)
api/seed.ts       POST — harvest + upsert, idempotent
src/timeline/     Infinite canvas (imperative transforms + GSAP camera)
src/placard/      Era-styled placard overlay
src/gallery/      Three.js engine + 6 room themes + procedural textures
src/art/          Deterministic era-styled placeholder art (copyright fallback)
```

**Image guardrails:** most game box art on Wikipedia is fair-use (non-free), so the
harvester checks Commons `extmetadata` licensing, walks the article's other images for a
free alternative, and otherwise flags the item for **stylized procedural placeholder art**
— there is no broken-image state anywhere in the app.

**Naming dedup:** every catalog entry carries regional aliases; the harvester follows
Wikipedia redirects to canonical titles and skips entries that resolve to an
already-seeded article.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server (catalog mode) |
| `npm run build` | typecheck + production bundle |
| `npm run preview` | serve the production bundle |
| `npm run typecheck` | `tsc --noEmit` over src + api + shared |
