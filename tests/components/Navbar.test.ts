import { describe, expect, test } from 'vitest';
import Navbar from '../../src/components/Navbar.astro';
import { render, texts } from './render';

const expected = [
  ['Inicio', '#inicio'],
  ['Servicios', '#servicios'],
  ['Sobre Mí', '#sobre-mi'],
  ['Formación', '#formacion'],
  ['Contacto', '#contacto'],
];

describe('Navbar', () => {
  test('desktop and mobile menus list the same sections in page order', async () => {
    const doc = await render(Navbar);
    const desktop = [...doc.querySelectorAll('ul:not(#mobile-menu) a')];
    const mobile = [...doc.querySelectorAll('#mobile-menu a')];

    for (const links of [desktop, mobile]) {
      expect(links.map((a) => [a.textContent?.trim(), a.getAttribute('href')])).toEqual(expected);
    }
  });

  test('logo links back to the top of the page', async () => {
    const doc = await render(Navbar);
    const logo = doc.querySelector('header a');

    expect(logo?.getAttribute('href')).toBe('#inicio');
    expect(texts([logo!])[0]).toBe('Itzayanha Rico');
  });

  test('mobile toggle is wired to the menu and starts collapsed', async () => {
    const doc = await render(Navbar);
    const toggle = doc.getElementById('mobile-menu-toggle');

    expect(toggle?.getAttribute('aria-controls')).toBe('mobile-menu');
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    expect(doc.getElementById('mobile-menu')?.classList.contains('is-open')).toBe(false);
    expect(texts(toggle!.querySelectorAll('.sr-only'))).toEqual(['Abrir menú']);
  });
});
