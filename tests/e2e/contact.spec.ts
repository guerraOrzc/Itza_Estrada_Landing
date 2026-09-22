import { expect, test } from '@playwright/test';

test('browser blocks submitting an empty form', async ({ page }) => {
  await page.goto('/#contacto');
  await page.getByRole('button', { name: 'Enviar mensaje' }).click();

  await expect(page).toHaveURL(/\/#contacto$/);
  expect(await page.locator('#nombre').evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);
});

test('browser rejects a malformed email', async ({ page }) => {
  await page.goto('/#contacto');
  await page.fill('#email', 'no-es-correo');

  expect(await page.locator('#email').evaluate((el: HTMLInputElement) => el.validity.typeMismatch)).toBe(true);
});

// Known gap: the Cloudflare adapter emits dist/_worker.js, and Pages ignores
// functions/ when a _worker.js exists, so /api/contact falls through to the
// homepage. Flip to `test` once the endpoint is served.
test('contact endpoint answers with JSON', async ({ request }) => {
  test.fail();
  const res = await request.post('/api/contact', {
    data: { nombre: 'Ana', email: 'ana@example.com', mensaje: 'Hola' },
  });

  expect(res.headers()['content-type']).toContain('application/json');
  expect(await res.json()).toMatchObject({ success: true });
});
