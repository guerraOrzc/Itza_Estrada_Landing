import { expect, test } from '@playwright/test';

const sections = [
  ['Servicios', 'servicios'],
  ['Sobre Mí', 'sobre-mi'],
  ['Formación', 'formacion'],
  ['Contacto', 'contacto'],
  ['Inicio', 'inicio'],
] as const;

test.describe('desktop navigation', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop links are hidden on mobile');

  for (const [label, id] of sections) {
    test(`"${label}" scrolls to #${id}`, async ({ page }) => {
      await page.goto('/');
      await page.locator('header ul:not(#mobile-menu)').getByRole('link', { name: label }).click();

      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator(`#${id}`)).toBeInViewport();
    });
  }

  test('hero CTA jumps to the contact form', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Agenda tu cita' }).click();

    await expect(page.locator('#contacto form')).toBeInViewport();
  });
});

test.describe('mobile menu', () => {
  test.skip(({ isMobile }) => !isMobile, 'hamburger only shows on mobile');

  test('opens and closes with the toggle', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('#mobile-menu-toggle');
    const menu = page.locator('#mobile-menu');

    await expect(menu).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(menu).toBeVisible();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeHidden();
  });

  test('closes after choosing a section and scrolls to it', async ({ page }) => {
    await page.goto('/');
    await page.locator('#mobile-menu-toggle').click();
    await page.locator('#mobile-menu').getByRole('link', { name: 'Contacto' }).click();

    await expect(page.locator('#mobile-menu')).toBeHidden();
    await expect(page.locator('#contacto')).toBeInViewport();
  });

  test('closes on Escape', async ({ page }) => {
    await page.goto('/');
    await page.locator('#mobile-menu-toggle').click();
    await page.keyboard.press('Escape');

    await expect(page.locator('#mobile-menu')).toBeHidden();
  });

  test('closes when tapping outside', async ({ page }) => {
    await page.goto('/');
    await page.locator('#mobile-menu-toggle').click();
    await page.locator('#servicios h2').click({ force: true });

    await expect(page.locator('#mobile-menu')).toBeHidden();
  });
});
