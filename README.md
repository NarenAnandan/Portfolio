# Portfolio — Narendiran Anandan

[![Deploy to Firebase Hosting](https://github.com/NarenAnandan/Portfolio/actions/workflows/firebase-hosting-merge.yml/badge.svg?branch=main)](https://github.com/NarenAnandan/Portfolio/actions/workflows/firebase-hosting-merge.yml)
[![Live site](https://img.shields.io/badge/live-portfolio--bf3e6.web.app-14684A?style=flat-square&logo=googlechrome&logoColor=white)](https://portfolio-bf3e6.web.app)
[![Hosting](https://img.shields.io/badge/hosting-Firebase%20Spark-FFCA28?style=flat-square&logo=firebase&logoColor=black)](#hosting)
[![License](https://img.shields.io/badge/license-Apache%202.0-16211F?style=flat-square)](LICENSE)

[![Dependencies](https://img.shields.io/badge/runtime%20dependencies-none-14684A?style=flat-square)](#layout)
[![Payload](https://img.shields.io/badge/payload-464%20KB-14684A?style=flat-square)](#layout)
[![CSP](https://img.shields.io/badge/CSP-strict%2C%20no%20unsafe--inline-14684A?style=flat-square)](#security-posture)
[![Contrast](https://img.shields.io/badge/contrast-WCAG%20AA-14684A?style=flat-square)](#editing-rules)
[![Trackers](https://img.shields.io/badge/analytics%20%26%20cookies-none-14684A?style=flat-square)](#security-posture)

Personal site for **Narendiran (Naren) Anandan**, DevOps & platform engineer.
Hand-written HTML, CSS and vanilla JS. No framework, no build step, no runtime
dependency, no third-party request, no analytics, no cookies.

Live: <https://portfolio-bf3e6.web.app>

Total deployed payload is **~464 KB**; a cold first visit pulls roughly **160 KB**
(HTML + CSS + JS + the two latin font subsets). Repeat visits are near-free —
fonts and images are served `immutable` for a year.

## Layout

```
index.html                  Single-page site (the whole thing)
404.html                    Not-found page
css/site.css                Design tokens + every page style
scripts/theme.js            Pre-paint sheet restore — loaded synchronously in <head>
scripts/site.js             Progressive enhancement (see below)
fonts/                      Self-hosted Archivo + Azeret Mono
                            (variable woff2, latin + latin-ext subsets)
images/                     Certification badges — currently unreferenced by the page
favicon.svg
robots.txt  sitemap.xml  .well-known/security.txt
firebase.json               Hosting config, including every security header
.github/workflows/          Deploy on push to main
```

`scripts/site.js` is entirely progressive enhancement — the page is complete and
readable with it blocked. It handles: the sheet toggle, the service history bar,
scroll reveals, the capability gauges, the count-up tally, nav scrollspy, and
copy-to-clipboard on the email address.

## Design system

The visual language is an **engineering drafting sheet**: pale drafting film,
ink, hairline rules, and one operational green used only for things that are
live or current. Dark mode is a *negative print* of the same sheet
(`<html data-sheet="negative">`), not a separate theme — the tokens invert, the
design does not change.

Archivo is a variable font and the hierarchy is carried by its **width axis**
rather than by size alone: `wdth 116` for display, `wdth 74` for the uppercase
title-block keys, `wdth 100` for prose. Azeret Mono carries anything numeric.

The repeated structural device is the **dot-leader index row**, a drafting
convention, used for certifications and education. Contact is laid out as a
drafting title block.

The one deliberately loud element is the **service history bar** — one tick per
month of continuous infrastructure work since Oct 2021, coloured by employer,
with a wider gap at each January. Keep boldness concentrated there and
everything around it quiet.

### Things that were deliberately not done

Terminal and console motifs, skill chips, and `01 / 02 / 03` section numbering
were all rejected. Don't reintroduce them — extend the drafting metaphor instead.

## Editing content

**Roles.** The history bar, its month count, and the "years in infrastructure"
tally are all derived from one array in `scripts/site.js`:

```js
var ROLES = [
  { key: 'eastlink',  start: [2021, 9] },   // month index is 0-based
  { key: 'pythian',   start: [2022, 4] },
  { key: 'shopliftr', start: [2023, 2] }    // current
];
```

Add a role here and the chart extends itself; nothing else needs touching. Each
`key` needs a matching colour rule in `css/site.css` (`.tick[data-role='…']` and
`.legend i[data-role='…']`) and a legend entry in `index.html`. Only
infrastructure roles belong in this array — the Dalhousie teaching assistantship
is intentionally excluded so the run reads unbroken. It still appears in full
under **Work**.

**Capability gauges.** The value lives in `data-level` on the `.gauge` element
and is rendered by an attribute selector in the stylesheet, not an inline style.
A new value needs a new rule:

```css
[data-level='85'] .gauge__fill { width: 85%; }
```

**Certifications.** Plain `.index__row` anchors. Keep the credential URL — the
section header claims they're independently verifiable.

## Editing rules

> **No inline `<script>`, `<style>` or `style=` in the HTML. Ever.**

The strict CSP below has no `'unsafe-inline'`, so any inline script or style is
silently dropped by the browser. The deploy workflow greps for them and fails
the build before it can reach production. When you need a dynamic value, drive
it from a `data-` attribute with a stylesheet rule (see the gauges above), or
set it from JS via CSSOM — both are allowed; inline attributes are not.

Two accessibility floors are baked into the tokens and worth not regressing:

* `--ink-3`, the faintest text tone, sits at **4.6:1** in light and 5.3:1 in
  dark. It was 2.55:1 before and failed. Don't lighten it.
* Control borders (`.btn`, `.sheet-toggle`) use `--ink-2`, not `--hairline`, to
  clear the **3:1** non-text contrast minimum. `--hairline` is for decorative
  rules only.

## Security posture

* **Strict CSP** — `default-src 'none'` with an explicit allowlist and no
  `'unsafe-inline'`.
* Sent both as a `Content-Security-Policy` **header** (`firebase.json` — the
  authoritative copy, and the only place `frame-ancestors` has any effect) and
  as a `<meta http-equiv>` fallback so the policy still applies when a file is
  opened directly from disk.
* HSTS with `preload`, `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
  a deny-by-default `Permissions-Policy`, `Cross-Origin-Opener-Policy` and
  `Cross-Origin-Resource-Policy` set to `same-origin`.
* **No third-party requests at runtime.** Fonts are self-hosted, so there is no
  call to Google Fonts and no cookie is set. `connect-src 'none'`.
* Every outbound link carries `rel="noopener noreferrer"`.
* GitHub Actions runs with `permissions: contents: read` and
  `persist-credentials: false`, and both actions are **pinned to a commit SHA**
  rather than a moving tag, so a retagged or compromised release cannot silently
  change what executes.
* Deploy ignores `.git`, `.github`, `.firebase`, `.gitignore`, `.DS_Store`,
  shell scripts, Markdown and `LICENSE` — nothing but the site itself ships.
* `.well-known/security.txt` carries a contact address. **It has an `Expires`
  date of 2027-09-01 and must be refreshed before then** or it is formally
  invalid.

### Verified

Console clean; light, dark and mobile all render correctly; no horizontal
overflow between 320px and 1920px; valid heading order; every link and button
has an accessible name; `prefers-reduced-motion` respected; and the page is
fully readable with JavaScript disabled, with the gauges rendering at their
real widths.

## Hosting

Firebase Hosting, on the free **Spark** plan. This was reconsidered against
Vercel in Sept 2026 and deliberately kept:

* The site is static with no build step, no SSR and no serverless functions, so
  Vercel's actual advantages don't apply. On the part that matters — custom
  response headers — the two are equivalent.
* Vercel's Hobby tier is **non-commercial-only** by its terms. Spark has no such
  clause.
* Google Cloud certifications plus hosting on Google's platform is a coherent
  story for this particular site.

**The one ceiling to know about:** Spark allows 10 GB of storage but caps
transfer at **360 MB/day** — a daily limit, not monthly. At ~160 KB per cold
visit that's roughly 2,200 first-time visitors a day before it stops serving.

If this ever needs to move — monetisation, or an SSR framework — the target is
**Cloudflare Pages** (unlimited bandwidth, no commercial-use restriction,
headers via a `_headers` file), not Vercel.

**Do not use GitHub Pages for this site.** It cannot set custom response
headers, so the CSP would degrade to the `<meta>` fallback alone: no
`frame-ancestors`, no HSTS, no `Permissions-Policy`.

## Domain

`canonical`, `og:url`, `sitemap.xml` and `security.txt` all point at
`portfolio-bf3e6.web.app` on purpose. **`narenanandan.com` currently serves a
separate résumé site, not this repo.** Update all four together once that domain
points here.

## Local preview

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

The security headers in `firebase.json` are applied by Firebase Hosting only, so
a plain static server won't show them. To exercise the real thing:

```bash
firebase emulators:start                    # local, with headers
firebase hosting:channel:deploy preview     # a real preview URL
```

## Deploy

Pushing to `main` deploys to the live channel via GitHub Actions. Manual:

```bash
firebase deploy --only hosting
```
