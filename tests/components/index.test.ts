import { describe, expect, test } from 'vitest';
import Index from '../../src/pages/index.astro';
import { render } from './render';

describe('index page', () => {
  test('every in-page link points at a section that exists', async () => {
    const doc = await render(Index);
    const targets = new Set(
      [...doc.querySelectorAll('a[href^="#"]')]
        .map((a) => a.getAttribute('href')!)
        .filter((href) => href !== '#'),
    );

    expect(targets.size).toBeGreaterThan(0);
    for (const href of targets) {
      expect(doc.getElementById(href.slice(1)), href).not.toBeNull();
    }
  });

  test('sections appear in navbar order', async () => {
    const doc = await render(Index);
    const ids = [...doc.querySelectorAll('main section[id]')].map((s) => s.id);

    expect(ids).toEqual(['inicio', 'servicios', 'sobre-mi', 'formacion', 'contacto']);
  });

  test('has a single h1 and unique ids', async () => {
    const doc = await render(Index);
    const ids = [...doc.querySelectorAll('[id]')].map((el) => el.id);

    expect(doc.querySelectorAll('h1')).toHaveLength(1);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('is served in Spanish with a description', async () => {
    const doc = await render(Index);

    expect(doc.documentElement.getAttribute('lang')).toBe('es');
    expect(doc.querySelector('meta[name="description"]')?.getAttribute('content')).toBeTruthy();
  });

  // Known gap: BaseLayout only puts `title` into og/twitter meta, never a <title> element.
  // Flip to `test` once the layout renders one.
  test.fails('has a document <title>', async () => {
    const doc = await render(Index);

    expect(doc.querySelector('head title')?.textContent).toContain('Itzayanha Rico');
  });
});
