import { expect, test } from '@playwright/test';

test('tabs filter cards by category', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('#servicios .svc-card');
  const visible = cards.locator('visible=true');

  await expect(visible.first()).toHaveAttribute('data-category', 'servicio');

  await page.getByRole('tab', { name: /Por padecimiento/ }).click();
  await expect(page.getByRole('tab', { name: /Por padecimiento/ })).toHaveAttribute('aria-selected', 'true');
  for (const category of await visible.evaluateAll((els) => els.map((el) => el.getAttribute('data-category')))) {
    expect(category).toBe('padecimiento');
  }
});

test('clicking a card flips it and the back button flips it back', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('#servicios .svc-card:not([hidden])').first();
  const title = (await card.locator('h3').textContent())!.trim();

  await page.getByRole('button', { name: `Ver más sobre ${title}` }).click();
  await expect(card).toHaveAttribute('data-flipped', 'true');
  await expect(card.getByRole('link', { name: 'Agenda tu cita' })).toBeVisible();

  await card.getByRole('button', { name: `Volver a ${title}` }).click();
  await expect(card).toHaveAttribute('data-flipped', 'false');
});

test('card media files are served', async ({ page, request }) => {
  await page.goto('/');
  const media = await page
    .locator('#servicios video')
    .evaluateAll((els) => els.flatMap((el) => [el.getAttribute('src')!, el.getAttribute('poster')!]));

  expect(media.length).toBeGreaterThan(0);
  for (const path of media) {
    const res = await request.get(path);
    expect(res.headers()['content-type'], path).toMatch(/^(image|video)\//);
  }
});

test('cover loop plays only while hovered', async ({ page, isMobile }) => {
  test.skip(isMobile, 'hover only applies to mouse pointers');
  await page.goto('/');
  const card = page.locator('#servicios .svc-card:not([hidden])').first();
  const video = card.locator('video');
  const paused = () => video.evaluate((v: HTMLVideoElement) => v.paused);

  expect(await paused()).toBe(true);
  await card.hover();
  await expect.poll(paused).toBe(false);
  await page.mouse.move(0, 0);
  await expect.poll(paused).toBe(true);
});
