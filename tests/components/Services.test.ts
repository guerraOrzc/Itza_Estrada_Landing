import { getCollection } from 'astro:content';
import { describe, expect, test } from 'vitest';
import Services from '../../src/components/Services.astro';
import { render, texts } from './render';

describe('Services', () => {
  test('renders one card per entry, sorted by order', async () => {
    const services = await getCollection('services');
    const expected = services
      .sort((a, b) => a.data.order - b.data.order)
      .map((s) => s.data.title);

    const doc = await render(Services);

    expect(expected.length).toBeGreaterThan(0);
    expect(texts(doc.querySelectorAll('#servicios .svc-card h3'))).toEqual(expected);
  });

  test('has one tab per category, with the first selected', async () => {
    const doc = await render(Services);
    const tabs = [...doc.querySelectorAll('#servicios [role="tab"]')];

    expect(tabs.map((t) => t.getAttribute('data-category'))).toEqual(['servicio', 'padecimiento']);
    expect(tabs.map((t) => t.getAttribute('aria-selected'))).toEqual(['true', 'false']);
  });

  test('only cards of the selected category start visible', async () => {
    const doc = await render(Services);
    const cards = [...doc.querySelectorAll('#servicios .svc-card')];

    expect(cards.some((c) => c.getAttribute('data-category') === 'padecimiento')).toBe(true);
    for (const card of cards) {
      const visible = !card.hasAttribute('hidden');
      expect(visible).toBe(card.getAttribute('data-category') === 'servicio');
    }
  });

  test('each card has a toggle and an inert back face with details', async () => {
    const doc = await render(Services);

    for (const card of doc.querySelectorAll('#servicios .svc-card')) {
      const toggle = card.querySelector('.svc-open');
      const back = card.querySelector('.svc-back');

      expect(toggle?.getAttribute('aria-expanded')).toBe('false');
      expect(toggle?.getAttribute('aria-controls')).toBe(back?.id);
      expect(back?.hasAttribute('inert')).toBe(true);
      expect(back?.querySelector('.svc-back-desc')?.textContent?.trim()).not.toBe('');
      expect(back?.querySelectorAll('li').length).toBeGreaterThan(0);
      expect(back?.querySelector('a[href="#contacto"]')).not.toBeNull();
    }
  });

  test('video covers are muted, lazy loops with a poster', async () => {
    const doc = await render(Services);
    const videos = doc.querySelectorAll('#servicios .svc-card video');

    expect(videos.length).toBeGreaterThan(0);
    for (const video of videos) {
      expect(video.hasAttribute('muted')).toBe(true);
      expect(video.hasAttribute('loop')).toBe(true);
      expect(video.hasAttribute('playsinline')).toBe(true);
      expect(video.getAttribute('preload')).toBe('none');
      expect(video.getAttribute('poster')).toMatch(/^\/images\/services\/.+\.jpg$/);
    }
  });
});
