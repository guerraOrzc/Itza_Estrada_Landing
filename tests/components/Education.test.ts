import { getCollection } from 'astro:content';
import { describe, expect, test } from 'vitest';
import Education from '../../src/components/Education.astro';
import { render, texts } from './render';

describe('Education', () => {
  test('renders certifications in order with year and institution', async () => {
    const certs = (await getCollection('certifications')).sort((a, b) => a.data.order - b.data.order);
    const doc = await render(Education);
    const items = [...doc.querySelectorAll('#formacion article')];

    expect(certs.length).toBeGreaterThan(0);
    expect(items).toHaveLength(certs.length);
    items.forEach((article, i) => {
      expect(texts(article.querySelectorAll('h3'))).toEqual([certs[i].data.title]);
      expect(article.textContent).toContain(certs[i].data.institution);
    });
    expect(texts(doc.querySelectorAll('#formacion time'))).toEqual(
      certs.map((c) => String(c.data.year)),
    );
  });

  test('alternates card sides on desktop', async () => {
    const doc = await render(Education);
    const rows = [...doc.querySelectorAll('#formacion article')].map(
      (a) => a.parentElement!.parentElement!.className,
    );

    expect(rows.length).toBeGreaterThan(1);
    rows.forEach((cls, i) => {
      expect(cls).toContain(i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse');
    });
  });
});
