import { test, expect } from '@playwright/test';

test('all content sections render', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/');
  for (const s of ['hero', 'about', 'experience', 'casestudies', 'metrics', 'education', 'contact']) {
    await expect(page.locator(`[data-section="${s}"]`)).toBeAttached();
  }
  await expect(page.locator('h1')).toContainText('Naren Anandan');
  expect(errors, `console/page errors: ${errors.join(' | ')}`).toHaveLength(0);
});

test('WebGL canvas gets a context', async ({ page }) => {
  await page.goto('/');
  const hasContext = await page.evaluate(() => {
    const c = document.getElementById('scene') as HTMLCanvasElement | null;
    if (!c) return false;
    // Renderer already claimed the context; getContext returns the same one.
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  });
  expect(hasContext).toBeTruthy();
});
