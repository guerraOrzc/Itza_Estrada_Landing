import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { parseHTML } from 'linkedom';

type RenderOptions = Parameters<AstroContainer['renderToString']>[1];

/** Renders an Astro component and returns a queryable document. */
export async function render(component: AstroComponentFactory, options?: RenderOptions) {
  const container = await AstroContainer.create();
  // The container ignores `site`, so SEO falls back to the request URL.
  const html = await container.renderToString(component, {
    request: new Request('https://itzaestrada.com/'),
    ...options,
  });
  // Wrap fragments so linkedom always builds a full document.
  const { document } = parseHTML(html.includes('<html') ? html : `<!doctype html><html><body>${html}</body></html>`);
  return document;
}

export function texts(elements: Iterable<Element>) {
  return [...elements].map((el) => el.textContent?.replace(/\s+/g, ' ').trim());
}
