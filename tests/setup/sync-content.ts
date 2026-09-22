import { execFileSync } from 'node:child_process';

/**
 * Under Vitest, `astro:content` reads the dev data store at `.astro/data-store.json`,
 * but `astro sync`/`build` write to `cacheDir` (node_modules/.astro). Sync straight
 * into `.astro` so tests always see the current content, including on fresh clones.
 *
 * Runs in a child process because Vite rewrites the `astro` import inside Vitest.
 */
export default function setup() {
  execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      "import { sync } from 'astro'; await sync({ configFile: false, cacheDir: './.astro', logLevel: 'error' });",
    ],
    { stdio: 'inherit' },
  );
}
