import { getCollection } from 'astro:content';
import { describe, expect, test } from 'vitest';
import Services from '../../src/components/Services.astro';
import { render, texts } from './render';

describe('Services', () => {
  test('renders one card per service, sorted by order', async () => {
    const services = await getCollection('services');
    const expected = services
      .sort((a, b) => a.data.order - b.data.order)
      .map((s) => s.data.title);

    const doc = await render(Services);

    expect(expected.length).toBeGreaterThan(0);
    expect(texts(doc.querySelectorAll('#servicios article h3'))).toEqual(expected);
  });

  test('each card shows its description and a decorative icon', async () => {
    const doc = await render(Services);
    const cards = doc.querySelectorAll('#servicios article');

    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      expect(card.querySelector('p')?.textContent?.trim()).not.toBe('');
      expect(card.querySelector('span')?.getAttribute('aria-hidden')).toBe('true');
    }
  });
});
