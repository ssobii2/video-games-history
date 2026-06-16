# Responsive Mobile/Tablet Support Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox (`- [ ]`) syntax.
> This repo has **no unit-test suite and no linter** — verification is `npm run typecheck`,
> `npm run build`, and browser checks at real viewports. Do **not** add a test framework.
> Do **not** run `git commit` — commits are deferred to the user.

**Goal:** Make the whole site fully responsive — visually and functionally — on phones, tablets,
and small screens, with touch controls for the 3D gallery and the infinite-canvas timeline.

**Architecture:** Adapt the existing single-codebase UI. Add a device/orientation gate, touch
input gestures (timeline pinch, gallery joystick + drag-look + tap-inspect), and a responsive CSS
pass. Touch devices are forced into landscape; non-touch devices are never gated.

**Tech Stack:** Vite + React 18 + TypeScript + Three.js + GSAP. Pointer Events for touch.

Spec: `docs/superpowers/specs/2026-06-16-responsive-mobile-tablet-design.md`

---

## File Structure

- `src/DeviceGate.tsx` (renamed from `DesktopGate.tsx`) — touch/orientation detection hook +
  RotateGate overlay.
- `src/App.tsx` — wire device gate; thread `isTouch` to Timeline + Gallery.
- `src/timeline/Timeline.tsx` — pinch-to-zoom + `isTouch` hint/`touch-action`.
- `src/gallery/GalleryApp.ts` — touch input branch + `setMoveAxis`.
- `src/gallery/Gallery.tsx` — joystick overlay, touch prompt/crosshair, pass `isTouch`.
- `src/gallery/Joystick.tsx` (new) — DOM virtual joystick.
- `src/styles.css` — responsive breakpoints + joystick/rotate-gate styles.
- `index.html` — viewport meta zoom lock.

---

## Task 1: Device & orientation gate

**Files:**
- Rename/rewrite: `src/DesktopGate.tsx` → `src/DeviceGate.tsx`
- Modify: `src/App.tsx` (import + gate usage + thread `isTouch`)
- Modify: `src/styles.css` (`.desktop-gate*` → `.rotate-gate*`)

- [ ] **Step 1:** Create `src/DeviceGate.tsx`. Replace the old gate with:

```tsx
import { useEffect, useState } from 'react';

function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(hover: none)').matches
  );
}

function isPortrait(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(orientation: portrait)').matches;
}

export interface DeviceState {
  isTouch: boolean;
  blockedPortrait: boolean;
}

export function useDeviceState(): DeviceState {
  const compute = (): DeviceState => {
    const isTouch = isTouchDevice();
    return { isTouch, blockedPortrait: isTouch && isPortrait() };
  };
  const [state, setState] = useState<DeviceState>(() => compute());
  useEffect(() => {
    const check = () => setState(compute());
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);
  return state;
}

export function RotateGate() {
  return (
    <div className="rotate-gate">
      <div className="rotate-gate-inner">
        <div className="rotate-gate-icon" aria-hidden="true">📱↻</div>
        <div className="rotate-gate-headline">Rotate to landscape</div>
        <p className="rotate-gate-body">
          The Museum of Video Game History is a wide, immersive space.
          Turn your device sideways to step inside.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2:** Delete `src/DesktopGate.tsx` (now replaced). Update `src/App.tsx`:
  - Change import (line 12) from
    `import { useIsBlockedDevice, DesktopGate } from './DesktopGate';`
    to `import { useDeviceState, RotateGate } from './DeviceGate';`
  - Replace line 19 `const blocked = useIsBlockedDevice();` with
    `const { isTouch, blockedPortrait } = useDeviceState();`
  - Replace line 144 `if (blocked) return <DesktopGate />;` with
    `if (blockedPortrait) return <RotateGate />;`
  - Pass `isTouch` to `<Timeline ... isTouch={isTouch} />` (line 189) and
    `<Gallery ... isTouch={isTouch} />` (lines 193-201).

- [ ] **Step 3:** In `src/styles.css`, rename the `.desktop-gate` rule block to `.rotate-gate`
  with matching child classes (`.rotate-gate-inner`, `.rotate-gate-icon`,
  `.rotate-gate-headline`, `.rotate-gate-body`). Keep it a centered full-screen overlay
  (`position: fixed; inset: 0; display: flex; align-items: center; justify-content: center`),
  arcade-styled to match the existing palette. Large icon, readable on a small portrait screen.

- [ ] **Step 4:** Verify: `npm run typecheck` — expect no errors. (Timeline/Gallery `isTouch`
  props are added in later tasks; if typecheck complains about unknown prop, add the optional
  `isTouch?: boolean` to those component prop interfaces now as a stub.)

---

## Task 2: Timeline pinch-to-zoom

**Files:**
- Modify: `src/timeline/Timeline.tsx` (input handlers ~line 160-250, hint ~line 295, props)

- [ ] **Step 1:** Add `isTouch?: boolean` to the Timeline props interface and destructure it.

- [ ] **Step 2:** Read the existing `onWheel` handler (~line 166) to learn the exact zoom math
  (how it converts wheel delta to a scale and re-centers). Extract that into a local helper
  `const zoomAt = (scaleFactor: number, clientX: number, clientY: number) => { ... }` that both
  wheel and pinch call. `onWheel` now computes `scaleFactor` from `e.deltaY` and calls `zoomAt`.

- [ ] **Step 3:** Add active-pointer tracking. Keep a `const pointers = new Map<number, {x:number;y:number}>()`
  in the effect. In `onPointerDown` add the pointer; in `onPointerMove` update it; in
  `onPointerUp`/`onPointerCancel` delete it.

- [ ] **Step 4:** Pinch branch in `onPointerMove`: when `pointers.size === 2`, compute the
  distance between the two pointers and the midpoint. Track `lastPinchDist`; on each move compute
  `scaleFactor = dist / lastPinchDist`, call `zoomAt(scaleFactor, midX, midY)`, update
  `lastPinchDist`. While 2 pointers are down, **skip** the single-pointer pan logic (guard the
  existing `dragging` path with `if (pointers.size >= 2) return;`). Reset `lastPinchDist` to
  null when pointer count drops below 2.

- [ ] **Step 5:** Apply `touch-action: none` to the timeline viewport — either inline on the
  `vp` element or via its CSS class (the element that holds the wheel/pointer listeners).

- [ ] **Step 6:** Swap the hint (~line 295): when `isTouch`, render
  `drag to pan · pinch to zoom · tap an era to dive in` instead of the desktop hint.

- [ ] **Step 7:** Verify: `npm run typecheck`. Then browser check at a touch landscape viewport
  (Task 7) — confirm two-finger pinch zooms and one-finger drag pans.

---

## Task 3: Gallery engine touch input (`GalleryApp.ts`)

**Files:**
- Modify: `src/gallery/GalleryApp.ts` (options type, `bindInput` ~line 334-399, `tick` ~line 489-520, fields)

- [ ] **Step 1:** Add `isTouch?: boolean` to the `GalleryApp` constructor options/callbacks type.
  Store `this.isTouch = !!opts.isTouch`. Add fields: `private touchMove = { x: 0, y: 0 };`
  and a `setMoveAxis(x: number, y: number)` public method that clamps to −1..1 and stores it.

- [ ] **Step 2:** In `bindInput()`, branch on `this.isTouch`:
  - **Desktop path:** unchanged (pointer-lock click, `mousemove`, WASD).
  - **Touch path:** do NOT request pointer lock. Set `this.locked = true` once at start (and call
    `this.callbacks.onLockChange?.(true)`) so existing gating in `tick()` and the inspect flow
    treats touch as active. Add a `touchSens` constant (e.g. `0.0035`).

- [ ] **Step 3:** Touch look + tap, using Pointer Events on `this.renderer.domElement`:
  - On `pointerdown` (pointerType `touch`): record `startX/startY`, `lastX/lastY`, `moved=false`,
    capture the pointer.
  - On `pointermove`: if inspecting/transitioning, ignore. Compute `dx = e.clientX - lastX`,
    `dy = e.clientY - lastY`; apply `this.yaw -= dx * touchSens; this.pitch -= dy * touchSens;`
    clamp pitch to `[-1.45, 1.45]` (same as desktop). Update `lastX/lastY`; if movement exceeds a
    small threshold (e.g. 8px total), set `moved=true`.
  - On `pointerup`: if `!moved` and not inspecting/transitioning → treat as a tap: build NDC from
    the tap point — `x = (clientX/clientWidth)*2-1`, `y = -(clientY/clientHeight)*2+1` — set the
    raycaster from camera with that vector, intersect `this.displays.flatMap(d => d.hitMeshes)`,
    and `enterInspect` the matching display on a hit. (Mirror the desktop click raycast but from
    the tap point instead of screen center.)
  - Ignore pointers whose `target` is inside the joystick element (it stops propagation itself in
    Task 4, but also guard here by checking the pointer started on the canvas).

- [ ] **Step 4:** In `tick()` move-build (~line 506-513), after the WASD adds, incorporate the
  analog vector:

```ts
if (this.touchMove.x !== 0 || this.touchMove.y !== 0) {
  move.addScaledVector(fwd, -this.touchMove.y);
  move.addScaledVector(right, this.touchMove.x);
}
```

  (Placed before `if (move.lengthSq() > 0) move.normalize();` so it composes with keys.)

- [ ] **Step 5:** In `enterInspect`/`exitInspect`, guard the pointer-lock calls so they only run
  when `!this.isTouch` (touch has no pointer lock; `exitInspect` should just restore pose and set
  `this.locked = true` again on touch instead of `requestPointerLock`).

- [ ] **Step 6:** Verify: `npm run typecheck`.

---

## Task 4: Joystick component + gallery chrome (`Joystick.tsx`, `Gallery.tsx`)

**Files:**
- Create: `src/gallery/Joystick.tsx`
- Modify: `src/gallery/Gallery.tsx` (props, pass isTouch, render joystick, swap prompt/crosshair)

- [ ] **Step 1:** Create `src/gallery/Joystick.tsx` — a self-contained DOM joystick:

```tsx
import { useRef } from 'react';

interface Props {
  onChange: (x: number, y: number) => void;
}

/** Thumb joystick. Reports a normalized vector (x right, y down), zero on release. */
export function Joystick({ onChange }: Props) {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const activeId = useRef<number | null>(null);

  const setKnob = (dx: number, dy: number) => {
    if (knobRef.current) knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  const onDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    activeId.current = e.pointerId;
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (activeId.current !== e.pointerId || !baseRef.current) return;
    e.stopPropagation();
    const r = baseRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const max = r.width / 2;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > max) { dx = (dx / dist) * max; dy = (dy / dist) * max; }
    setKnob(dx, dy);
    onChange(dx / max, dy / max);
  };
  const onUp = (e: React.PointerEvent) => {
    if (activeId.current !== e.pointerId) return;
    e.stopPropagation();
    activeId.current = null;
    setKnob(0, 0);
    onChange(0, 0);
  };

  return (
    <div
      className="gallery-joystick"
      ref={baseRef}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <div className="gallery-joystick-knob" ref={knobRef} />
    </div>
  );
}
```

- [ ] **Step 2:** In `src/gallery/Gallery.tsx`:
  - Add `isTouch?: boolean` to `Props`; destructure it.
  - Pass `isTouch` into the `new GalleryApp(mount, era, items, { ...callbacks, isTouch })` options.
  - Import `Joystick`. When `isTouch`, render `<Joystick onChange={(x, y) => appRef.current?.setMoveAxis(x, y)} />`
    (only while not inspecting).
  - Swap the prompt (~line 97-101): when `isTouch`, show
    `Drag to look · joystick to move · tap a frame to inspect`.
  - Hide the crosshair on touch: change the condition (~line 94) to `{locked && !inspected && !isTouch && ...}`.

- [ ] **Step 3:** Verify: `npm run typecheck`.

---

## Task 5: Joystick + rotate-gate CSS

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1:** Add `.gallery-joystick` styles: fixed, bottom-left, above the canvas
  (`z-index` above `.gallery-mount`, below modals), ~120px circle, translucent ring,
  `touch-action: none`, only meaningful on touch (it's only rendered then). Knob ~52px,
  centered, `pointer-events: none` so the base captures the gesture. Position so it does not
  overlap `.hud-back`.

- [ ] **Step 2:** Confirm `.rotate-gate` styles from Task 1 read well in portrait (large icon,
  centered text, padding for safe areas). Verify: `npm run typecheck` + `npm run build`.

---

## Task 6: Responsive CSS pass + viewport meta

**Files:**
- Modify: `index.html` (viewport meta)
- Modify: `src/styles.css` (breakpoints across all overlays)

- [ ] **Step 1:** `index.html` viewport meta →
  `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no" />`

- [ ] **Step 2:** Expand `src/styles.css` responsive rules. Add/extend blocks:
  - `@media (max-width: 1024px)` (tablet) — moderate shrink of masthead title + buttons; ensure
    overlays use `min(Xpx, 92vw)` widths.
  - `@media (max-width: 760px)` (phone) — masthead buttons icon-only or wrapped and ≥44px tap
    targets; placard single-column (already present, verify); search/quiz/data/credits cards
    near-full-width with scrollable bodies; gallery HUD compact; inspect-panel full-width.
  - `@media (max-height: 520px)` (short landscape) — cap modal `max-height` and make their bodies
    `overflow-y: auto`; shrink vertical paddings/margins on masthead, placard, inspect-panel,
    quiz, data panel, credits so they fit a ~390px-tall viewport without clipping the close button.
  - Ensure all close buttons (`.credits-close`, `.inspect-close`, search/quiz/data closers) are
    ≥44px and not overlapped.

- [ ] **Step 3:** Verify: `npm run typecheck` + `npm run build`.

---

## Task 7: Browser verification at real viewports

**Files:** none (verification only)

- [ ] **Step 1:** With the dev server running, use a browser at these viewports and confirm:
  - **Phone landscape ~844×390:** timeline pans (1-finger) + pinches (2-finger) to zoom; tap an
    era dives in; gallery joystick walks, drag looks around, tap a frame opens the inspect panel;
    every overlay (search, quiz, data, credits, placard) fits and scrolls; close buttons reachable.
  - **Tablet landscape ~1180×820:** same, roomier; nothing clipped.
  - **Portrait on a touch profile (coarse pointer):** RotateGate shows and blocks the app.
  - **Small laptop ~1280×720 (fine pointer, hover):** NO gate, NO rotate prompt; desktop
    pointer-lock gallery + wheel zoom still work; layout not broken.

- [ ] **Step 2:** Fix any clipping/overlap/gesture issues found, re-verify. Final
  `npm run typecheck` + `npm run build`.

---

## Self-review notes

- **Spec coverage:** WS1→Task 1; WS2→Task 2; WS3→Tasks 3-4; WS4→Tasks 5-6; verification→Task 7. ✓
- **Type consistency:** `isTouch` flows App→Timeline/Gallery→GalleryApp options; `setMoveAxis`,
  `touchMove`, `useDeviceState`/`RotateGate`/`DeviceState` names used consistently. ✓
- **No test framework added** (repo has none); verification via typecheck/build/browser. ✓
- **No git commits** (deferred to user). ✓
