# Portfolio — Narendiran Anandan

[![Deploy to Firebase Hosting](https://github.com/NarenAnandan/Portfolio/actions/workflows/firebase-hosting-merge.yml/badge.svg?branch=main)](https://github.com/NarenAnandan/Portfolio/actions/workflows/firebase-hosting-merge.yml)
[![PR checks](https://github.com/NarenAnandan/Portfolio/actions/workflows/pr-checks.yml/badge.svg)](https://github.com/NarenAnandan/Portfolio/actions/workflows/pr-checks.yml)
[![Live site](https://img.shields.io/badge/live-portfolio--bf3e6.web.app-38BDF8?style=flat-square&logo=googlechrome&logoColor=white)](https://portfolio-bf3e6.web.app)
[![Hosting](https://img.shields.io/badge/hosting-Firebase%20Spark-FFCA28?style=flat-square&logo=firebase&logoColor=black)](#hosting)
[![License](https://img.shields.io/badge/license-Apache%202.0-0B1220?style=flat-square)](LICENSE)

[![Astro](https://img.shields.io/badge/built%20with-Astro%207-0B1220?style=flat-square&logo=astro&logoColor=white)](#layout)
[![Payload](https://img.shields.io/badge/payload-204%20KB-047857?style=flat-square)](#checks)
[![CSP](https://img.shields.io/badge/CSP-strict%2C%20no%20unsafe--inline-047857?style=flat-square)](#security-posture)
[![Contrast](https://img.shields.io/badge/contrast-WCAG%20AA-047857?style=flat-square)](#editing-rules)
[![Trackers](https://img.shields.io/badge/analytics%20%26%20cookies-none-047857?style=flat-square)](#security-posture)

Personal site for **Narendiran (Naren) Anandan**, DevOps, SRE and platform engineer. Built with [Astro](https://astro.build) as a fully static site: Astro runs at build time only, and the browser gets plain HTML, one stylesheet, three small scripts of our own and the vendored swarm-build module. No third-party request, no analytics, no cookies. The hero entrance is [swarm-build](https://github.com/habom2310/swarm-build), vendored and served from this origin.

Live: <https://portfolio-bf3e6.web.app>

Total deployed payload is **204 KB**, about half of it the four self-hosted font files. Fonts and Astro's hashed `/_astro/` assets are cached `immutable` for a year, scripts for an hour (their URLs carry a per-build `?v=`), and HTML is `must-revalidate`, so a deploy is visible immediately. CI fails the build above a 600 KB budget.

## Layout

```
src/data/site.ts            All page content: profile, topology, metrics, case studies, roles, skills, credentials
src/pages/index.astro       The single page; lays out src/data/site.ts
src/pages/404.astro         Not-found page
src/layouts/Base.astro      <head>, CSP meta fallback, script tags with the per-build ?v=
src/styles/global.css       Design tokens and every style (emitted as one external, hashed file)
public/scripts/theme.js     Pre-paint: theme restore and the swarm-build guard
public/scripts/build.js     ES module: the swarm-build entrance
public/scripts/site.js      Progressive enhancement and the dynamic elements (see below)
public/vendor/swarm-build/  swarm-build.js and its MIT LICENSE, copied unchanged from upstream
public/fonts/               Self-hosted Bricolage Grotesque, Geist and Geist Mono (variable woff2, latin subsets) and their OFL licences
public/                     favicon-na.svg, robots.txt, sitemap.xml, .well-known/security.txt
astro.config.mjs            Static output; never inline styles or scripts (see Editing rules)
firebase.json               Hosting config: serves dist/, every security header, cache rules
.github/workflows/          Deploy on push to main; checks + preview on every PR
.github/scripts/            check-site.py, the pre-merge checks over dist/
```

`public/scripts/site.js` is progressive enhancement only: the page is complete and readable with it blocked. It runs the dynamic elements listed under Design, plus the theme switch, nav scrollspy and copy-to-clipboard on the email address.

## Design

The visual concept is an **infrastructure diagram on a dotted canvas**. The hero is a topology (a centre node for Naren, four satellites for what he runs) that swarm-build's cursors draw node by node, and they go on to build each section as you scroll to it. Each section is a dashed "zone", like a VPC boundary in an architecture diagram, labelled `zone / work` and so on. Nothing is carried over from the previous drafting-sheet site: not its fonts, headline, location eyebrow, history bar, gauges or status dot.

The page is written for a recruiter's first 30 seconds. There is no logo or name mark in the top bar, only the section links and the theme switch. The left column of the hero is plain text (role, headline, summary and contact buttons), so a skimmer never has to read the diagram. Below come how I work, case studies, experience, skills, credentials and contact. Location appears only in the contact section.

Dark is the default canvas; light follows the OS or the switch (`data-theme`). Bricolage Grotesque is the display face, Geist carries body text, and Geist Mono is for labels, dates and chips. Colour roles: cyan `--accent` for links, focus, packets and the centre node; green `--ok` for current and in-production; violet `--violet` for labels.

**Dynamic elements** (all in `site.js`, all off or static under reduced motion):

* The headline types and deletes a rotating word (`rotating` in `site.ts`). Screen readers get the full sentence once, from a visually hidden copy.
* Packets travel along the topology edges, and hovering or focusing a satellite node lights its edge. Clicking a node jumps to Skills with that group selected.
* A gradient progress bar under the masthead tracks scroll position.
* The experience timeline's rail fills as you scroll, and each role's dot lights up as it passes. Each role's duration, the total, and the "yrs in production" figure are computed from the roles' `start`/`end`.
* Skills have filter chips (one group, or all). On phones the page starts compact: case studies closed and one skill group shown.
* Case studies are native `<details>` cards that animate open where the browser supports `::details-content`.
* The contact section shows the current time in Eastern Time, so visitors know when a reply is likely.

Skills are listed with two markers: a filled green dot for tools in production use at work every week, and a cyan ring for hands-on experience. Self-rated skill bars and percentage gauges were dropped on purpose; recruiters discount them.

### The swarm-build entrance

On a visitor's first page view in a browser session, five cursors named after pipeline stages (`plan`, `build`, `test`, `deploy`, `observe`) build the whole page, block by block. Elements marked `data-swarm-block` are the blocks; nested blocks (a section's cards inside its dashed zone) wait for their parent. The hero builds straight away; every other section (`data-swarm-section`) gets its own swarm, started just before it scrolls into view, so the build follows the reader down the page.

swarm-build keeps a block hidden and `inert` until it is built, so `build.js` limits how long and how far that can last:

* `theme.js` adds `.swarm` to `<html>` before first paint, which hides only the hero's blocks. It skips this if the session has already seen the build, the visitor prefers reduced motion, or the browser has no ES module support. If `build.js` never runs, a CSS animation shows the hero after 2.5 s anyway.
* A section is only handed to swarm-build when it is within 60% of a screen of the viewport, so content far below the fold is never hidden. A screen reader that never scrolls reads everything. Sections already on screen at load (a reload mid-page, or a `#link`) are left alone, so nothing flashes.
* Each swarm is capped: the hero at 6 s and each section at 8 s, after which it jumps to the finished state.
* Any click or key press finishes every running swarm and turns the effect off for the visit. Scrolling and touch-scrolling do not, because scrolling is how the build moves on.
* The footer's "Watch it build again" button replays it from the top, moving focus to `<main>` first. It stays hidden for reduced-motion visitors.

To update swarm-build, copy `src/swarm-build.js` and `LICENSE` from upstream into `public/vendor/swarm-build/`, read the diff, and watch one full build in a browser.

## Editing content

Everything on the page comes from `src/data/site.ts`; `index.astro` only lays it out.

**Roles.** Each role has `start: [year, month]` and, unless it is current, `end` (months 0-based). Durations, the total and the hero's "yrs in production" all derive from them.

**Case studies.** Keep the Situation / What I did / What changed shape, and leave out internal names, customers, hostnames, spend and incident counts.

**Skills.** Each item is `[name, 'prod' | 'hands']`. Use `prod` only for tools used at work every week.

**Certifications.** Only list one with a working issuer verification URL; the section says each one is verifiable.

**Résumé.** The hero links to a Google Drive file (`profile.resume`). To self-host instead, put `resume.pdf` in `public/` (without a phone number) and set `resume: '/resume.pdf'`.

## Editing rules

> **No inline `<script>`, `<style>` or `style=` in the built HTML. Ever.**

The strict CSP has no `'unsafe-inline'`, so any inline script or style is silently dropped by the browser. Astro would normally inline small stylesheets, so `astro.config.mjs` sets `build.inlineStylesheets: 'never'` and `vite.build.assetsInlineLimit: 0`. Browser scripts live in `public/scripts/` and are linked with `<script is:inline src=…>`, which Astro leaves untouched. Never write an `is:inline` script or style without `src`, or a `style=` attribute; `check-site.py` scans `dist/` and fails the build if anything inline reaches the HTML. Drive dynamic values from a `data-` attribute with a stylesheet rule, or set them from JS through the CSSOM (swarm-build does this).

Contrast floors: the faintest text tone `--ink-3` is 6.7:1 on the dark canvas and 6.6:1 on light; `--ok` is 9.0:1 dark and 5.1:1 light; every swarm cursor colour is at least 5:1 against its white label. Control borders use `--ink-3`, not `--line`, to clear the 3:1 non-text minimum. `--line` and `--edge` are decorative only. Fonts and the favicon are cached `immutable`, so a changed file must get a new file name (that is why the icon is `favicon-na.svg`).

## Security posture

* **Strict CSP**: `default-src 'none'` with an explicit allowlist and no `'unsafe-inline'`. The module script and the vendored library are same-origin, so `script-src 'self'` covers them.
* Sent as a `Content-Security-Policy` **header** (`firebase.json`, the authoritative copy and the only place `frame-ancestors` has any effect) and as a `<meta http-equiv>` fallback in `Base.astro`.
* HSTS with `preload`. On a `*.web.app` domain Firebase overrides this with its own zone-wide value (`max-age=31556926`), so the configured `max-age` only takes effect on a custom domain. Don't "fix" the mismatch. Also `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, a deny-by-default `Permissions-Policy`, and `Cross-Origin-Opener-Policy` and `Cross-Origin-Resource-Policy` set to `same-origin`.
* **No third-party requests at runtime.** Fonts and swarm-build are self-hosted; `connect-src 'none'`.
* Every outbound link carries `rel="noopener noreferrer"`. The page shows an email address but no phone number.
* **Dependencies**: one, `astro`, pinned to an exact version in `package.json` with a committed `package-lock.json`. CI installs with `npm ci --ignore-scripts`, so the lockfile is the source of truth and no package install script runs. Astro runs only at build time; none of its code ships to the browser.
* **Secrets never meet npm.** Each workflow has a `build` job (install, build, checks, upload `dist/` as an artifact) with no secrets, and a separate deploy or preview job that downloads `dist/` and runs only the Firebase action. `firebase-tools` is pinned (`firebaseToolsVersion: 15.28.2`) instead of the action's default `latest`. Versions from 15.34 also call the Service Usage API, which needs `serviceusage.services.get` (role Service Usage Consumer) on the deploy service account; grant that before bumping. The live deploy job only runs for `main`, even from a manual `workflow_dispatch`, and PR previews skip fork and Dependabot PRs, which cannot read the deploy secret.
* GitHub Actions is read-only by default (`permissions: contents: read`, `persist-credentials: false`); the preview job adds only `pull-requests` and `checks` write. Every action is pinned to an **exact release tag** (for example `actions/checkout@v7.0.1`), never a moving major tag.
* Firebase serves only `dist/`, the build output, so source, config, lockfile and dotfiles never ship. `firebase.json` also ignores `**/.env*` as a backstop, and `.gitignore` keeps `.env` files and `node_modules/` out of git.
* `.well-known/security.txt` (in `public/`) carries a contact address. **Its `Expires` date is 2027-09-01 and must be refreshed before then**, or it is formally invalid.

### Verified

On 2026-11-10, against `dist/` on a local server in Chrome: no console errors; dark, light and 375 px mobile render with no horizontal overflow; the swarm build runs and leaves no overlay, `inert` or `clip-path` behind; under reduced motion it never starts and every block is visible; the rotator, node-to-skills filter, timeline fill, durations, progress bar and clock all work. Both workflows pass actionlint, and a clean `npm ci --ignore-scripts` build succeeds.

## Hosting

Firebase Hosting, on the free **Spark** plan. This was reconsidered against Vercel in Sept 2026 and deliberately kept:

* The site is static with no SSR and no serverless functions, so Vercel's actual advantages don't apply. On the part that matters, custom response headers, the two are equivalent.
* Vercel's Hobby tier is **non-commercial-only** by its terms. Spark has no such clause.
* Google Cloud certifications plus hosting on Google's platform is a coherent story for this particular site.

**The one ceiling to know about:** Spark allows 10 GB of storage but caps transfer at **360 MB/day**, a daily limit, not monthly. At roughly 180 KB per cold visit (HTML, CSS, JS, swarm-build and three latin font files) that's about 2,000 first-time visitors a day before it stops serving.

If this ever needs to move (monetisation, or SSR), the target is **Cloudflare Pages** (unlimited bandwidth, no commercial-use restriction, headers via a `_headers` file), not Vercel.

**Do not use GitHub Pages for this site.** It cannot set custom response headers, so the CSP would degrade to the `<meta>` fallback alone: no `frame-ancestors`, no HSTS, no `Permissions-Policy`.

## Domain

`site` in `astro.config.mjs` (which sets `canonical` and `og:url`), `public/sitemap.xml`, `public/robots.txt` and `public/.well-known/security.txt` all point at `portfolio-bf3e6.web.app` on purpose. **`narenanandan.com` currently serves a separate résumé site, not this repo.** Update all of them together once that domain points here.

## Checks

`.github/scripts/check-site.py` guards the things that fail *silently* in a browser, the class of regression a human reading a diff will not catch. It reads `dist/`, so build first. Zero dependencies, no network:

```bash
npm run build && npm run check
```

| Check | Catches |
| --- | --- |
| No inline `<script>` / `<style>` / `style=` / `on*=` | Silent CSP breakage: the browser drops it with no error |
| Every local `href`/`src`, JS `import` and CSS `url()` resolves | Dangling asset references after a rename |
| `target="_blank"` carries `rel="noopener"` | Tabnabbing regression |
| Payload within 600 KB | An unoptimised image slipping in |
| `security.txt` has not expired | The `Expires` date lapsing unnoticed |

It runs on every pull request (`pr-checks.yml`) and again on the deploy job as a last line of defence.

**Preview deploys.** Once the checks pass, each PR from this repo also gets a Firebase preview channel: a real URL, with the real response headers, expiring after seven days. That is the only way to exercise the CSP header before merge. Fork PRs skip this job, since they cannot read secrets.

The PR workflow is deliberately separate from the deploy workflow. That one has exactly one job, ship to the live channel, and nothing in the PR workflow can reach it.

## Local development

Astro 7 needs Node 22.23.4 or later (`.nvmrc` pins 24). With a matching Node:

```bash
npm ci
npm run dev        # http://localhost:4321, live reload
npm run build      # writes dist/
npm run check      # the CI checks, against dist/
```

Without a matching Node, run the same commands in a container:

```bash
docker run --rm -it -u "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD":/app -w /app -p 4321:4321 node:24-bookworm-slim npm run dev
```

The security headers in `firebase.json` are applied by Firebase Hosting only, and the dev server does not set the CSP header. To exercise the real thing:

```bash
npm run build
firebase emulators:start                    # serves dist/ locally, with headers
firebase hosting:channel:deploy preview     # a real preview URL
```

To see the swarm build again in the same tab, run `sessionStorage.removeItem('built')` in the console and reload, or use the footer button.

## Deploy

Pushing to `main` builds and deploys to the live channel via GitHub Actions. Manual:

```bash
npm run build && firebase deploy --only hosting
```

## Credits

The cursor-swarm entrance is [swarm-build](https://github.com/habom2310/swarm-build) (MIT), whose idea comes from Joel Califa's [Swarm](https://califa.github.io/swarm-site/).
