# Responsive Mobile/Tablet Support — Design Spec

Date: 2026-06-16
Branch: `feat/responsive-mobile-tablet`

## Goal

The whole website is fully responsive — visually **and** functionally — on phones, tablets,
and small screens generally. No more "NO ENTRY" gate. The 3D gallery and the infinite-canvas
timeline become usable by touch with the same 3D movement and camera the desktop has.

## Decisions (confirmed with user)

- **Gallery touch controls:** virtual joystick (walk) + drag-to-look + tap-a-frame-to-inspect.
  Keep it simple, no extras. Same 3D movement and camera as desktop.
- **Tablets:** treated as a roomier phone layout — one mobile codepath that scales fluidly.
  No separate tablet branch.
- **Orientation:** **forced landscape on touch devices only.** A touch device held in portrait
  shows a "rotate to landscape" gate and the app is blocked until rotated. Once landscape, the
  full app runs. Non-touch devices (laptops/desktops, including small ones) are **never** gated
  or rotate-prompted — responsive CSS still benefits them at narrow widths.
- **Browser pinch-zoom:** disabled globally (`maximum-scale=1, user-scalable=no`) so page zoom
  does not fight the timeline pinch-zoom and gallery drag gestures.
- **DesktopGate snark copy:** removed; replaced by the RotateGate.

## Approach

**Adapt the existing UI** with a thin touch-input layer + a responsive CSS pass. One codebase,
one source of truth. No parallel mobile components (rejected: duplication/drift). Not CSS-only
(rejected: gallery pointer-lock and timeline wheel-zoom have no touch equivalent, so it would
stay non-functional).

Key constraint from the forced-landscape decision: a landscape **phone** is wide but **short**
(~844×390). The timeline/gallery canvases fit any size; the real layout pressure is **vertical
height for modals/overlays**. So overlays lean on `max-height` media queries, not just width.

## Workstreams

### WS1 — Device & orientation gate (replaces `src/DesktopGate.tsx`)

- Repurpose the file as the device gate (rename to `src/DeviceGate.tsx`; update the import in
  `src/App.tsx`).
- Detection:
  - `isTouch = matchMedia('(pointer: coarse)').matches || matchMedia('(hover: none)').matches`
  - `isPortrait = matchMedia('(orientation: portrait)').matches`
- Hook `useDeviceGate()` returns `{ isTouch, blockedPortrait }` where
  `blockedPortrait = isTouch && isPortrait`. Re-evaluates on `resize` + `orientationchange`
  (same listener pattern the current hook already uses).
- `App.tsx`: if `blockedPortrait` → render `<RotateGate />`. Delete the `innerWidth < 900`
  hard block entirely. Thread `isTouch` down to `<Timeline>` and `<Gallery>`.
- `RotateGate` component: full-screen overlay, rotate-phone icon/emoji + "Rotate your device to
  landscape to enter the museum." Styled via a new `.rotate-gate` rule (replaces `.desktop-gate`).

### WS2 — Timeline pinch-to-zoom (`src/timeline/Timeline.tsx`)

- Existing behavior kept: single-pointer drag = pan (already touch-capable via Pointer Events);
  `wheel` = zoom (desktop).
- Refactor the wheel-zoom math into a reusable `zoomBy(scaleDelta, clientX, clientY)` so wheel
  and pinch share one code path (zoom anchored at a screen point).
- Track active pointers in a `Map<pointerId, {x,y}>`. When exactly 2 are down → pinch:
  the change in pinch distance drives `zoomBy`, anchored at the midpoint; suppress pan while
  pinching. Back to 1 pointer → resume pan.
- Apply `touch-action: none` to the timeline viewport so the browser does not steal the gesture.
- Accept an `isTouch` prop; swap the hint text to
  "drag to pan · pinch to zoom · tap an era to dive in" on touch.

### WS3 — Gallery touch controls (`src/gallery/GalleryApp.ts`, `Gallery.tsx`, new `Joystick.tsx`)

- `GalleryApp` gains an `isTouch` option (passed from `Gallery.tsx`). Desktop path unchanged.
- Touch input branch in `bindInput()`:
  - No pointer lock. Look/move are always active in touch mode (treat as "locked"=active for the
    purposes of the existing gating, but driven by touch, not `requestPointerLock`).
  - Drag on the canvas (a touch pointer that moves) → apply `yaw`/`pitch` deltas, same math as the
    desktop `mousemove` handler (scaled by a touch sensitivity constant).
  - Tap on the canvas (pointer down→up with negligible movement) → raycast **from the tap point**
    (NDC from `clientX/clientY`) instead of screen-center → `enterInspect` on a hit display.
  - Pointers that start on the joystick DOM element are ignored by the canvas look/tap handler.
- Analog movement: add `setMoveAxis(x, y)` storing a `touchMove` vector (−1..1). In `tick()`,
  when `touchMove` is non-zero, add `fwd * (−touchMove.y) + right * touchMove.x` to the move
  vector (alongside the existing WASD path). ~3-line change; movement/camera math untouched.
- `Gallery.tsx`: accept `isTouch`; when touch:
  - render a new `<Joystick onChange={(x,y) => app.setMoveAxis(x,y)} />` DOM overlay (bottom-left),
  - swap the prompt to "Drag to look · joystick to move · tap a frame to inspect",
  - hide the center crosshair (tap targets directly).
- `Joystick.tsx`: small self-contained DOM control — a base circle + draggable knob, reports a
  normalized vector via `onChange`, resets to 0 on release. Pointer Events. Styled in CSS.

### WS4 — Responsive CSS pass (`src/styles.css`, `index.html`)

- `index.html`: viewport meta → `width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no`.
- Breakpoints:
  - tablet: `@media (max-width: 1024px)`
  - phone: `@media (max-width: 760px)`
  - short-landscape (modal fit): `@media (max-height: 520px)`
  - touch affordances (≥44px targets, joystick): gate on `(pointer: coarse)` where appropriate.
- Surfaces to make fit + reachable:
  - **masthead** — title shrinks; the 6 buttons condense (icon-only on phone) and/or wrap; must
    fit a ~667–900px-wide, short viewport.
  - **placard** (timeline detail) — already single-column at 760; ensure it scrolls within short
    landscape height.
  - **search palette**, **quiz**, **data panel**, **credits** — fit width + short height; bodies
    scroll; close buttons reachable.
  - **gallery HUD** + **inspect-panel** — HUD compact; inspect-panel full-width at phone, scrolls
    in short height; joystick does not overlap the back/mute buttons.
- Touch targets ≥44px; modal bodies `overflow-y: auto` with capped `max-height`.

## Out of scope

- Portrait layouts for the core timeline/gallery (forced landscape removes the need).
- A separate 2D gallery fallback (rejected in favor of true 3D touch controls).
- Any data/back-end/catalog changes. This is purely client UI + input.
- `src/tour/` (empty, unreferenced).

## Verification

- **Browser skill** at real viewports:
  - phone landscape (~844×390) — timeline pan/pinch, gallery joystick/look/tap, every overlay.
  - tablet landscape (~1180×820).
  - portrait on a touch profile — RotateGate shows and blocks.
  - small laptop (~1280×720, fine pointer) — **no** gate, no rotate prompt, app works.
- `npm run typecheck` and `npm run build` (the only verification gates in this repo).

## Execution notes

- Coding done by Sonnet subagents, one workstream at a time. Opus (main) verifies each before
  proceeding. WS1–WS3 are largely independent; WS4 consumes `isTouch` (WS1) and the new gallery
  DOM (WS3), so it partly lands last.
- No commits unless the user explicitly asks.
