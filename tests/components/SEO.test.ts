import { describe, expect, test } from 'vitest';
import SEO from '../../src/components/SEO.astro';
import { render } from './render';

const props = { title: 'Título de prueba', description: 'Descripción de prueba' };
const meta = (doc: Document, attr: string, key: string) =>
  doc.querySelector(`meta[${attr}="${key}"]`)?.getAttribute('content');

describe('SEO', () => {
  test('renders title and description across all meta tags', async () => {
    const doc = await render(SEO, { props });

    expect(meta(doc, 'name', 'description')).toBe(props.description);
    for (const key of ['og:title', 'og:description']) {
      expect(meta(doc, 'property', key)).toBe(key.endsWith('title') ? props.title : props.description);
    }
    expect(meta(doc, 'name', 'twitter:title')).toBe(props.title);
    expect(meta(doc, 'name', 'twitter:description')).toBe(props.description);
    expect(meta(doc, 'property', 'og:locale')).toBe('es_MX');
  });

  test('canonical and og:url are absolute URLs on the site domain', async () => {
    const doc = await render(SEO, { props, request: new Request('https://itzaestrada.com/') });

    const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
    expect(canonical).toBe('https://itzaestrada.com/');
    expect(meta(doc, 'property', 'og:url')).toBe(canonical);
  });

  test('resolves the share image to an absolute URL', async () => {
    const doc = await render(SEO, { props: { ...props, image: '/images/share.png' } });

    expect(meta(doc, 'property', 'og:image')).toBe('https://itzaestrada.com/images/share.png');
    expect(meta(doc, 'name', 'twitter:image')).toBe('https://itzaestrada.com/images/share.png');
  });

  test('emits valid JSON-LD for the practice and the practitioner', async () => {
    const doc = await render(SEO, { props });
    const jsonLd = JSON.parse(doc.querySelector('script[type="application/ld+json"]')!.textContent!);

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@graph'].map((node: { '@type': string }) => node['@type'])).toEqual([
      'Physiotherapy',
      'Person',
    ]);
  });

  test('accepts a custom schema', async () => {
    const schema = { '@context': 'https://schema.org', '@type': 'WebPage' };
    const doc = await render(SEO, { props: { ...props, schema } });

    expect(JSON.parse(doc.querySelector('script[type="application/ld+json"]')!.textContent!)).toEqual(schema);
  });
});
