import { getCollection } from 'astro:content';
import { describe, expect, test } from 'vitest';

describe('content collections', () => {
  test.each(['services', 'certifications'] as const)('%s have unique order values', async (name) => {
    const orders = (await getCollection(name)).map((entry) => entry.data.order);

    expect(orders.length).toBeGreaterThan(0);
    expect(new Set(orders).size).toBe(orders.length);
  });

  test('certification years are plausible', async () => {
    const thisYear = new Date().getFullYear();
    for (const cert of await getCollection('certifications')) {
      expect(cert.data.year).toBeGreaterThanOrEqual(1980);
      expect(cert.data.year).toBeLessThanOrEqual(thisYear);
    }
  });
});
