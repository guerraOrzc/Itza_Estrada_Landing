import { expect, test } from '@playwright/test';

test('clicking a card expands its panel and Escape collapses it', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('#formacion .edu-card').first();
  const title = (await card.locator('h3').textContent())!.trim();
  const toggle = card.getByRole('button', { name: title });
  const panel = card.locator('.edu-panel');

  expect((await panel.boundingBox())!.height).toBeLessThan(1);
  await toggle.click();
  await expect(card).toHaveAttribute('data-open', 'true');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(panel.locator('.edu-photo')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(card).toHaveAttribute('data-open', 'false');
  await expect(panel).toHaveAttribute('inert', '');
  await expect(toggle).toBeFocused();
});

test('clicking anywhere on the header toggles, and the timeline dot follows', async ({ page }) => {
  await page.goto('/');
  const row = page.locator('#formacion .edu-row').nth(1);
  const card = row.locator('.edu-card');

  const head = card.locator('.edu-head');
  // The toggle's hit area covers the whole header, so clicks near the corners count too.
  await head.click({ position: { x: 8, y: 8 } });
  await expect(card).toHaveAttribute('data-open', 'true');
  await expect(row).toHaveAttribute('data-open', 'true');
  await expect(page.locator('#formacion .edu-row').first()).not.toHaveAttribute('data-open', 'true');

  const box = (await head.boundingBox())!;
  await head.click({ position: { x: box.width - 8, y: box.height - 8 } });
  await expect(card).toHaveAttribute('data-open', 'false');
});

test('certification photos are served', async ({ page, request }) => {
  await page.goto('/');
  const srcs = await page.locator('#formacion img.edu-photo').evaluateAll((els) => els.map((el) => el.getAttribute('src')!));

  expect(srcs.length).toBeGreaterThan(0);
  for (const src of srcs) {
    const res = await request.get(src);
    expect(res.headers()['content-type'], src).toMatch(/^image\//);
  }
});
