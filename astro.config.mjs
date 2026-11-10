// Static output only. The site ships under a strict CSP with no 'unsafe-inline',
// so nothing may be inlined into the HTML: styles go to external files, and
// browser scripts live in public/ and are linked with is:inline + src.
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://portfolio-bf3e6.web.app',
  output: 'static',
  build: { inlineStylesheets: 'never', format: 'file' },
  vite: { build: { assetsInlineLimit: 0 } },
  devToolbar: { enabled: false },
});
