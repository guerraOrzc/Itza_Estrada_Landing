import { describe, expect, test } from 'vitest';
import Footer from '../../src/components/Footer.astro';
import Navbar from '../../src/components/Navbar.astro';
import { render } from './render';

describe('Footer', () => {
  test('quick links cover the same sections as the navbar', async () => {
    const footer = await render(Footer);
    const navbar = await render(Navbar);
    const hrefs = (doc: Document, selector: string) =>
      [...doc.querySelectorAll(selector)].map((a) => a.getAttribute('href')).sort();

    expect(hrefs(footer, 'footer nav a')).toEqual(hrefs(navbar, 'ul:not(#mobile-menu) a'));
  });

  test('shows the current year in the copyright', async () => {
    const doc = await render(Footer);

    expect(doc.querySelector('footer')?.textContent).toContain(`© ${new Date().getFullYear()}`);
  });

  test('social icons have accessible names', async () => {
    const doc = await render(Footer);
    const labels = [...doc.querySelectorAll('footer a[aria-label]')].map((a) => a.getAttribute('aria-label'));

    expect(labels).toEqual(['Instagram', 'Facebook', 'WhatsApp']);
  });
});
