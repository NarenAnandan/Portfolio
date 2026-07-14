# Deployment & security

## Hosting
Static build (`dist/`) on **Firebase Hosting** (free Spark plan). Global CDN +
automatic SSL are included.

## CI/CD
- `.github/workflows/firebase-hosting-merge.yml` — on push to `main`: `npm ci`,
  `npm run build`, deploy to the `live` channel.
- `.github/workflows/firebase-hosting-pull-request.yml` — on PRs from this repo:
  builds and posts a temporary **preview channel** URL (free).

Both require the `FIREBASE_SERVICE_ACCOUNT` GitHub secret.

## Free-tier features in use
- Global CDN + automatic managed SSL.
- `cleanUrls` (drops `.html`) and `trailingSlash: false`.
- Custom `404.html`.
- Long-lived immutable caching for content-hashed `/assets/**` and static media;
  `index.html` is `max-age=0, must-revalidate` so deploys take effect instantly.
- Per-PR preview channels.

## Security headers (set in `firebase.json`)
- **Content-Security-Policy:** `default-src 'self'`; scripts self-only; styles
  self + `'unsafe-inline'` (required by Lenis/GSAP inline style attributes);
  fonts self-hosted; `object-src 'none'`; `frame-ancestors 'none'`;
  `upgrade-insecure-requests`.
- **Strict-Transport-Security** (HSTS, 1 year, preload).
- **X-Content-Type-Options: nosniff**, **X-Frame-Options: DENY**,
  **Referrer-Policy: strict-origin-when-cross-origin**,
  **Permissions-Policy** (camera/mic/geo/FLoC disabled),
  **Cross-Origin-Opener-Policy: same-origin**.
- All external links use `rel="noopener noreferrer"`.

Verify headers after deploy:
```bash
curl -sI https://<your-domain>/ | grep -i -E 'content-security|strict-transport|x-content-type'
```

## Manual deploy (if ever needed)
```bash
npm run build
npx firebase-tools@latest deploy --only hosting
```
