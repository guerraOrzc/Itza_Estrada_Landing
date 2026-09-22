/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig(
  {
    test: {
      include: ['tests/unit/**/*.test.ts', 'tests/components/**/*.test.ts'],
      globalSetup: ['tests/setup/sync-content.ts'],
      coverage: {
        provider: 'v8',
        include: ['functions/**/*.ts', 'src/**/*.{ts,astro}'],
        // Schema definitions are consumed by Astro's content layer, not executed by tests.
        exclude: ['src/content/config.ts'],
        reporter: ['text', 'html'],
      },
    },
  },
  // Skip astro.config.mjs: the Cloudflare adapter boots a Miniflare proxy that
  // keeps Vitest from exiting. Components only need `site` to render.
  { configFile: false, site: 'https://itzaestrada.com' },
);
