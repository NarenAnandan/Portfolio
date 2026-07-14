# Editing your content

All résumé content lives in **`src/content/resume.ts`**, typed by
`src/content/types.ts`. Edit that one file — the DOM and animations update
automatically.

## Rules
- Only put **real, verifiable** facts here. Never invent numbers.
- Unknown specifics use a literal `[TODO: ...]` marker. A unit test
  (`tests/content.test.ts`) fails if any bracketed value is not a `[TODO`.

## Common edits
- **Experience line / tagline:** `resume.profile`.
- **Tech stack:** `resume.techStack` — array of `{ category, items }`.
- **Experience:** `resume.experience[]` — reverse-chronological.
- **Case studies:** `resume.caseStudies[]` — fill the `[TODO]` outcomes with
  real figures.
- **Metrics counters:** `resume.metrics[]` — `value` like `"30%"` animates from 0.
- **Certifications / education / contact:** the correspondingly named fields.

After editing, run `npm test` to confirm the content still validates.
