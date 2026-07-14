# Infrastructure City — Senior Infra Portfolio (Design Spec)

**Date:** 2026-07-14
**Owner:** Naren Anandan
**Status:** Approved — ready for implementation planning

## Goal

Redesign the existing static Bootstrap portfolio into a cinematic, scroll-driven
Three.js experience that positions Naren as a **senior infrastructure engineer**
eligible across **DevOps / Platform / SRE / Cloud** roles. The 3D "world" is a
stylized cloud reference architecture — flying through it literally demonstrates
how the candidate thinks about infrastructure, so the aesthetic and the substance
are the same object.

Success = a recruiter or hiring engineer lands on the page, is impressed by the
craft, and within one scroll comes away with concrete, credible evidence
(quantified impact, real tech stack, case studies, certs) that this person is
hireable at a senior level.

## Non-goals

- No paid AI tooling (no Higgsfield/Seedance/scroll-world pipeline). Everything is
  web-native and lives in the repo, editable forever.
- No fabricated facts, metrics, employers, or dates. All copy is polished from the
  candidate's real existing content; unknown specifics are explicit `[TODO]`
  placeholders for the owner to fill.
- No change to the candidate's real job titles.
- Not a CMS or multi-page app — single-page portfolio.

## Positioning

- Broad senior infra: **DevOps · Platform · SRE · Cloud** — framed so the candidate
  qualifies across all four tracks without diluting focus.
- Real titles preserved (DevOps Platform Engineer @ Shopliftr, DevOps Specialist @
  Pythian, NOC Engineer @ Eastlink, Graduate TA @ Dalhousie).
- Experience phrasing: **"5+ years in tech operations, 4+ in DevOps/Platform
  engineering."** Derived honestly from the timeline (NOC Oct 2021 → present ≈ 4.75
  yrs; pure DevOps from Pythian May 2022 ≈ 4 yrs). Owner to confirm/adjust.

## Decisions (locked)

| Dimension | Decision |
|---|---|
| Visual engine | Real-time Three.js WebGL world, camera flies through on scroll |
| Build stack | Vite + TypeScript + Three.js + GSAP ScrollTrigger + Lenis (smooth scroll) |
| World concept | Cloud Infrastructure City (low-poly, isometric, glowing data flows) |
| Content sections | Featured case studies + quantified metrics + tech stack grid + architecture diagrams |
| Content truth | Polished senior prose from real content; every claim owner-approved; `[TODO]` placeholders for missing specifics |
| Hosting | Firebase Hosting (retained), static build |

## Scroll journey → content map

Single page. A fixed full-viewport Three.js canvas renders the city; HTML content
sections scroll over it. Scroll progress (0→1) drives the camera along a spline
through the city, docking at landmarks.

| Scroll | Camera / landmark | Content |
|---|---|---|
| 0–15% | Orbit skyline, approach | **Hero** — name, title, `DevOps · Platform · SRE · Cloud`, CTAs (Download Resume, Get in touch), LinkedIn/GitHub |
| 15–30% | Dock at **VPC district** | **About** + **Tech Stack grid** (real, categorized) |
| 30–55% | Fly **CI/CD pipeline corridor** | **Experience** timeline (Shopliftr → Pythian → Eastlink → Dalhousie) |
| 55–80% | Weave the **Kubernetes cluster** | **Featured case studies** (2–4) |
| 80–92% | Rise to **observability tower** | **Impact metrics** (animated counters) + **Certifications** |
| 92–100% | Descend to **ground / HQ** | **Education** + **Contact** + footer |

## Architecture

Three independent layers, each understandable and editable in isolation.

### Layer 1 — Content (`src/content/resume.ts`)
- All resume data as typed objects: single source of truth.
- Rendered into the **DOM** (not the canvas) so it is ATS/recruiter readable,
  copyable, and SEO-indexable.
- Shape (typed interfaces): `profile`, `about`, `techStack` (categorized),
  `experience[]`, `caseStudies[]`, `metrics[]`, `certifications[]`, `education[]`,
  `contact`.

### Layer 2 — 3D world (`src/world/`)
- Procedural low-poly geometry — no external model/texture downloads.
- Modular scene pieces: `city.ts` (skyline), `vpc.ts` (district), `pipeline.ts`
  (CI/CD corridor), `cluster.ts` (K8s), `tower.ts` (observability), `ground.ts` (HQ).
- Instanced meshes for repeated elements (buildings, nodes, containers).
- Emissive materials + a bloom postprocessing pass for the glow.
- Capped `devicePixelRatio`; geometry/particle budgets tuned per device tier.

### Layer 3 — Scroll & camera (`src/scroll/`)
- Camera rig follows a `CatmullRomCurve3` spline through the scene.
- A GSAP ScrollTrigger timeline maps scroll % → camera position on the spline +
  `lookAt` target + which DOM section is "active" (for content reveal animations).
- Lenis provides inertial smooth scrolling that the timeline scrubs against.

### Entry point (`src/main.ts`)
- Boots the renderer, builds the world, wires content → DOM, initializes the scroll
  timeline, and runs the render loop. Handles resize and cleanup.

## Visual system

- **Aesthetic:** dark "control-room."
- **Palette:** deep navy / near-black background; **cyan/teal primary glow**; **amber
  accent**; muted grays for body text. (Observability-console palette.)
- **Type:** monospace (e.g. JetBrains Mono / IBM Plex Mono) for metrics, labels, and
  tech tags; clean geometric sans (Inter or Space Grotesk) for prose and headings.
- Content cards: translucent dark glass panels over the 3D world, subtle borders/glow,
  high text contrast for readability against the moving background.

## Content plan

Polished from real existing content only. Reframed around impact.

- **Hero:** "Naren Anandan", role line `DevOps · Platform · SRE · Cloud`, one-line
  senior value proposition, Download Resume + Get in touch CTAs, LinkedIn + GitHub.
- **About:** senior-level rewrite of the current about paragraph; Ottawa, Ontario;
  years-of-experience line (above).
- **Tech Stack grid** (real tools, categorized — drawn from existing content + certs):
  - Cloud: AWS, GCP, Azure
  - IaC: Terraform
  - Containers/Orchestration: Docker, Kubernetes
  - CI/CD: GitHub Actions
  - Observability: AWS CloudWatch, New Relic
  - SCM: Git, GitHub
  - Scripting: Python, Bash
  - (Owner may add/trim.)
- **Experience** (real, quantified where numbers already exist):
  - Shopliftr — DevOps Platform Engineer (Mar 2023–Present): AWS infra
    design/optimization; Bitbucket→GitHub migration (~30% operational cost
    reduction); CloudWatch + New Relic observability rollout.
  - Pythian Inc. — DevOps Specialist (May 2022–Feb 2023): CI/CD, Linux/Unix admin,
    build & release, cloud implementation in Agile teams.
  - Eastlink — NOC Engineer (Oct 2021–Apr 2022): 95%+ first-response SLA; 85% issues
    resolved internally; top-10% resolution.
  - Dalhousie University — Graduate Teaching Assistant (Jan 2019–Apr 2021).
- **Featured case studies (2–3 seeded, placeholders for specifics):**
  1. **AWS platform buildout & cost optimization** — problem → architecture → what
     was built → outcome (`[TODO: confirm scale/savings figures]`).
  2. **SCM migration: Bitbucket → GitHub** — drivers, approach, ~30% cost reduction,
     workflow/CI improvements (`[TODO: confirm team size / pipeline count]`).
  3. **Observability rollout (CloudWatch + New Relic)** — visibility gaps → what was
     instrumented → MTTR/uptime impact (`[TODO: confirm metrics]`).
- **Impact metrics** (animated counters, only real/approved numbers): e.g. 30% cost
  reduction, 95%+ SLA, plus `[TODO]` slots for uptime/MTTR/deploy-time if owner
  supplies them.
- **Certifications** (real, with credential links): Google Associate Cloud Engineer,
  Azure Developer, Terraform Associate, Google Professional DevOps Engineer.
- **Education:** M.Eng Electrical & Computer Engineering, Dalhousie (2018–2021);
  B.E. Electronics & Electrical Engineering, Anna University (2014–2018).
- **Contact:** email, phone, socials (values migrated from current site).

## Performance, accessibility, resilience (progressive enhancement)

The site must always work, degrading gracefully:

- **WebGL unsupported or renderer error** → hide canvas, render content as a clean
  static dark layout. Content is DOM-native so it survives with zero 3D.
- **`prefers-reduced-motion`** → disable camera scrubbing/parallax; sections appear
  with minimal/no animation; scroll behaves normally.
- **Mobile / low-power** → reduced geometry and particle counts, simplified camera
  path, capped pixel ratio; content fully readable and responsive.
- Lazy renderer init; pause render loop when tab hidden.
- **SEO/ATS:** all text in the DOM with proper semantic headings and meta tags.

## Deployment

- Retain Firebase Hosting.
- `npm run build` → `dist/`.
- Update `firebase.json` `hosting.public` → `dist`.
- Update `.github/workflows/firebase-hosting-merge.yml` to run `npm ci && npm run
  build` before deploy.
- Remove legacy `index.html` + Bootstrap/AOS/jQuery assets once the new site is
  verified. `construction.html` + `toggle-site.sh` behavior to be reviewed (keep a
  maintenance page or retire).

## Testing / verification (gates)

1. `tsc` typecheck passes; `npm run build` succeeds.
2. Lightweight Playwright smoke test: page loads; all content sections present in
   DOM; WebGL context created; no console errors.
3. Lighthouse performance pass (target: good scores on desktop + mobile).
4. Manual: cross-device responsive check + `prefers-reduced-motion` + WebGL-off
   fallback, driven via the `/verify` flow before completion.

## Open items for the owner

1. Confirm the years-of-experience phrasing.
2. Provide real specifics/metrics for the case-study `[TODO]` placeholders.
3. Confirm resume PDF link (current Google Drive link) and contact details are
   current.

## Out of scope / future

- Blog or writing section.
- Live status/observability widget pulling real telemetry.
- Multi-language.
