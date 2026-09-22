import { defineConfig, devices } from '@playwright/test';

const PORT = 4329;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  // `astro preview` isn't supported by the Cloudflare adapter, so serve the
  // build with the real Pages runtime instead.
  webServer: {
    command: `npm run build && wrangler pages dev dist --port ${PORT} --compatibility-date=2025-01-01`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
