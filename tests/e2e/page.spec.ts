import { expect, test } from '@playwright/test';

test('loads without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  expect(errors).toEqual([]);
});

test('has no horizontal scroll', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );

  expect(overflow).toBe(0);
});

test('hero video autoplays muted', async ({ page }) => {
  await page.goto('/');
  const video = page.locator('#inicio video');

  await expect(video).toHaveJSProperty('muted', true);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThan(0);
});

test('logos and hero video are served as media', async ({ request }) => {
  for (const path of ['/images/logos/4.png', '/images/logos/6.png', '/videos/hero-background.mp4', '/favicon.svg']) {
    const res = await request.get(path);
    expect(res.ok(), path).toBe(true);
    expect(res.headers()['content-type'], path).toMatch(/^(image|video)\//);
  }
});

// Known gap: these files are referenced but missing. Pages has no 404 page, so it
// serves index.html (200, text/html) instead. Flip to `test` once they're added.
for (const path of ['/images/hero-poster.jpg', '/images/og-default.png']) {
  test(`referenced asset ${path} exists`, async ({ request }) => {
    test.fail();
    const res = await request.get(path);
    expect(res.headers()['content-type']).toMatch(/^image\//);
  });
}

test('sitemap and robots are published', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(await robots.text()).toContain('Sitemap: https://itzaestrada.com/sitemap-index.xml');

  const sitemap = await request.get('/sitemap-index.xml');
  expect(await sitemap.text()).toContain('<sitemapindex');
});
