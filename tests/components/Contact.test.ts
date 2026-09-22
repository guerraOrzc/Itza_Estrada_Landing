import { describe, expect, test } from 'vitest';
import Contact from '../../src/components/Contact.astro';
import { render } from './render';

describe('Contact', () => {
  test('form posts to the contact endpoint', async () => {
    const form = (await render(Contact)).querySelector('#contacto form');

    expect(form?.getAttribute('action')).toBe('/api/contact');
    expect(form?.getAttribute('method')).toBe('POST');
  });

  test('field names match what the endpoint validates', async () => {
    const doc = await render(Contact);
    const controls = [...doc.querySelectorAll('form input, form textarea')];

    expect(controls.map((c) => c.getAttribute('name'))).toEqual([
      'nombre',
      'email',
      'telefono',
      'mensaje',
    ]);
    expect(controls.filter((c) => c.hasAttribute('required')).map((c) => c.getAttribute('name'))).toEqual([
      'nombre',
      'email',
      'mensaje',
    ]);
    expect(doc.querySelector('input[name="email"]')?.getAttribute('type')).toBe('email');
    expect(doc.querySelector('input[name="telefono"]')?.getAttribute('type')).toBe('tel');
  });

  test('every field has a matching label', async () => {
    const doc = await render(Contact);

    for (const control of doc.querySelectorAll('form input, form textarea')) {
      expect(doc.querySelector(`label[for="${control.id}"]`)).not.toBeNull();
    }
  });

  // Known gap: the endpoint checks a `website` honeypot but the form never sends one.
  // Flip to `test` once the hidden field is added.
  test.fails('includes a hidden honeypot field', async () => {
    const doc = await render(Contact);

    expect(doc.querySelector('form input[name="website"]')).not.toBeNull();
  });

  test('alternative contact links use tel: and mailto:', async () => {
    const doc = await render(Contact);

    expect(doc.querySelector('aside a[href^="tel:"]')).not.toBeNull();
    expect(doc.querySelector('aside a[href^="mailto:"]')).not.toBeNull();
  });
});
