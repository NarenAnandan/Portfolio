# Naren Anandan — Portfolio

A scroll-driven **Three.js** portfolio: a cinematic camera flight through a stylized
"cloud infrastructure city" that doubles as a reference architecture. Positioned for
senior **DevOps · Platform · SRE · Cloud** roles.

Built with Vite + TypeScript + Three.js + GSAP (ScrollTrigger) + Lenis. Fully
static, self-hosted fonts, no third-party runtime requests, deployed on Firebase
Hosting.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Typecheck + production build → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Smoke tests (Playwright) |

## Project layout

- `src/content/` — typed resume data (`resume.ts`) + DOM renderer. **Edit your
  résumé here.** See [docs/CONTENT.md](docs/CONTENT.md).
- `src/world/` — the procedural 3D scene (city, pipeline, cluster, tower).
- `src/scroll/` — camera path math + GSAP/Lenis scroll wiring + reveals.
- `src/styles/main.css` — the "control-room" design system.
- `docs/` — architecture, content, and deployment guides.

## Accessibility & resilience

- Works with WebGL disabled (content renders as a static dark layout).
- Honors `prefers-reduced-motion` (no camera scrubbing; instant reveals).
- Responsive down to small phones; all résumé text lives in the DOM (SEO/ATS
  readable), never inside the canvas.

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — how the three layers fit together.
- [Editing content](docs/CONTENT.md) — update your résumé, add case studies.
- [Deployment & security](docs/DEPLOYMENT.md) — Firebase hosting, headers, CI.
