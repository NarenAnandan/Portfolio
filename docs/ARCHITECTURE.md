# Architecture

The site is three independent layers wired together in `src/main.ts`.

## 1. Content (`src/content/`)
- `types.ts` — the `Resume` interface and its sub-types.
- `resume.ts` — the single source of truth (all real résumé data).
- `render.ts` — `renderContent(root, resume)` builds semantic DOM sections.
  Text is rendered into the DOM (not the canvas) so it is copyable, indexable,
  and readable by ATS/recruiters.

## 2. World (`src/world/`)
- `capability.ts` — pure WebGL detection + device-tier logic (unit-tested).
- `renderer.ts` — `createWorld(canvas, tier)`: light scene, hemisphere + shadow-casting key light, the light-table ground, resize, and shadow enabling.
- `materials.ts` — shared "light-table" palette + matte surface / accent materials.
- `city.ts`, `pipeline.ts`, `cluster.ts`, `tower.ts` — procedural landmarks.
- `postprocess.ts` — render pass-through (the light look uses matte shading + soft shadows, no bloom).

## 3. Scroll (`src/scroll/`)
- `path.ts` — the camera `CatmullRomCurve3` and `poseAt(progress)` math
  (unit-tested).
- `timeline.ts` — Lenis smooth scroll + GSAP ScrollTrigger drive the camera
  along the path from scroll position.
- `reveal.ts` — IntersectionObserver section reveals + metric counters.

## Data flow
Scroll position → GSAP ScrollTrigger → `poseAt(progress)` → camera transform.
The render loop animates the pipeline packets and tower rings and renders the
scene. Under `prefers-reduced-motion` it renders a single static frame instead.

## Progressive enhancement
`main.ts` checks `detectWebGL()`. If false, it adds `body.no-webgl` (canvas
hidden, gradient backdrop) and still runs `initReveal()`. `prefers-reduced-motion`
parks the camera and reveals content instantly.
