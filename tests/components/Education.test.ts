import { getCollection } from 'astro:content';
import { describe, expect, test } from 'vitest';
import Education from '../../src/components/Education.astro';
import EducationCard from '../../src/components/EducationCard.astro';
import { render, texts } from './render';

describe('Education', () => {
  test('renders certifications in order with year and institution', async () => {
    const certs = (await getCollection('certifications')).sort((a, b) => a.data.order - b.data.order);
    const doc = await render(Education);
    const items = [...doc.querySelectorAll('#formacion .edu-card')];

    expect(certs.length).toBeGreaterThan(0);
    expect(items).toHaveLength(certs.length);
    items.forEach((card, i) => {
      expect(texts(card.querySelectorAll('h3'))).toEqual([certs[i].data.title]);
      expect(card.querySelector('.edu-inst')?.textContent).toContain(certs[i].data.institution);
    });
    expect(texts(doc.querySelectorAll('#formacion time'))).toEqual(
      certs.map((c) => String(c.data.year)),
    );
  });

  test('each card has a collapsed toggle controlling an inert panel', async () => {
    const doc = await render(Education);

    for (const card of doc.querySelectorAll('#formacion .edu-card')) {
      const toggle = card.querySelector('.edu-toggle');
      const panel = card.querySelector('.edu-panel');

      expect(card.getAttribute('data-open')).toBe('false');
      expect(toggle?.getAttribute('aria-expanded')).toBe('false');
      expect(toggle?.getAttribute('aria-controls')).toBe(panel?.id);
      expect(panel?.hasAttribute('inert')).toBe(true);
      expect(panel?.querySelectorAll('.edu-topics li').length).toBeGreaterThan(0);
    }
  });

  test('alternates card sides of the timeline on desktop', async () => {
    const doc = await render(Education);
    const rows = [...doc.querySelectorAll('#formacion .edu-row')];

    expect(rows.length).toBeGreaterThan(1);
    rows.forEach((row, i) => {
      const even = i % 2 === 0;
      expect(row.className).toContain(even ? 'md:flex-row-reverse' : 'md:flex-row');
      expect(row.querySelector('.edu-card')?.classList.contains('edu-card--end')).toBe(even);
    });
  });

  test('expanded panels show the certification photos', async () => {
    const doc = await render(Education);
    const photos = [...doc.querySelectorAll('#formacion .edu-panel img.edu-photo')];

    expect(photos.length).toBeGreaterThan(0);
    for (const img of photos) {
      expect(img.getAttribute('src')).toMatch(/^\/images\/certifications\/.+\.jpg$/);
      expect(img.getAttribute('alt')).toBe('');
    }
  });
});

describe('EducationCard', () => {
  const base = { id: 'x', title: 'Curso', institution: 'Instituto', year: 2020, topics: [] };

  test('keeps title and institution in the header and omits empty sections', async () => {
    const doc = await render(EducationCard, { props: base });

    expect(doc.querySelector('.edu-head h3 button.edu-toggle')?.textContent?.trim()).toBe('Curso');
    expect(doc.querySelector('.edu-head .edu-inst')?.textContent).toBe('Instituto');
    expect(doc.querySelector('.edu-photo')).toBeNull();
    expect(doc.querySelector('.edu-desc')).toBeNull();
    expect(doc.querySelector('.edu-topics')).toBeNull();
    expect(doc.querySelector('.edu-doc')).toBeNull();
  });

  test('shows the certificate image in the panel when provided', async () => {
    const doc = await render(EducationCard, { props: { ...base, certificate: '/images/cert.jpg' } });
    const link = doc.querySelector('.edu-panel a.edu-doc');

    expect(link?.getAttribute('href')).toBe('/images/cert.jpg');
    expect(link?.querySelector('img')?.getAttribute('alt')).toBe('Documento: Curso');
  });
});
