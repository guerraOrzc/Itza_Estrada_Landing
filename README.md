# Itzayanha Rico — Fisioterapia

[![CI](https://github.com/guerraOrzc/Itza_Estrada_Landing/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/guerraOrzc/Itza_Estrada_Landing/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/guerraOrzc/Itza_Estrada_Landing/badges/coverage.json)](https://github.com/guerraOrzc/Itza_Estrada_Landing/actions/workflows/ci.yml)

Landing page for Itzayanha Rico's physiotherapy practice in San Luis Potosí, México. It's a single-page site in Spanish: a hero with a video background, then services, about, education and a contact form.

Live domain: [itzaestrada.com](https://itzaestrada.com)

## Stack

- [Astro 5](https://astro.build) — static output, content collections
- [Tailwind CSS 3](https://tailwindcss.com) + CSS design tokens
- [Cloudflare Pages](https://pages.cloudflare.com) — hosting, contact endpoint
- [Vitest](https://vitest.dev) + [Playwright](https://playwright.dev) — tests

## Getting started

Requires Node 18.17+ (CI uses Node 22).

```sh
npm install
npm run dev          # http://localhost:4321
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Build the site to `dist/` |
| `npm run typecheck` | Type-check Astro files (`astro check`) and the Pages Functions (`tsc`) |
| `npm test` | Run unit and component tests |
| `npm run test:watch` | Same, in watch mode |
| `npm run test:coverage` | Run tests with a coverage report (`coverage/index.html`) |
| `npm run test:e2e` | Build, serve with `wrangler pages dev`, and run Playwright on desktop and mobile Chrome |

> `astro preview` doesn't work with the Cloudflare adapter. To serve a build locally, run `npx wrangler pages dev dist`.

## Project structure

```
src/
├── pages/index.astro        # The single page: assembles every section
├── layouts/BaseLayout.astro # <html>, fonts, SEO
├── components/              # Navbar, Hero, Services, About, Education, Contact, Footer, SEO, wave dividers
├── content/
│   ├── config.ts            # Collection schemas
│   ├── services/*.md        # One file per service
│   └── certifications/*.md  # One file per degree/certification
└── styles/tokens.css        # Colors, type, spacing — the brand lives here
functions/api/contact.ts     # Contact form endpoint (Cloudflare Pages Function)
public/                      # Logos, favicon, hero video, robots.txt
tests/
├── unit/                    # Contact endpoint logic
├── components/              # Rendered HTML of each component and the page
├── e2e/                     # Real browser against the built site
└── setup/                   # Vitest global setup (content sync)
```

## Editing content

**Services and certifications** are Markdown files with frontmatter. The schema is checked at build time.

```md
<!-- src/content/services/manual-therapy.md -->
---
title: "Terapia Manual"
description: "Shown on the card."
icon: "🤲"
order: 1          # Sort position — must be unique
featured: true
---
```

```md
<!-- src/content/certifications/degree.md -->
---
title: "Licenciatura en Fisioterapia"
institution: "Universidad ..."
year: 2015
order: 1          # Timeline position — must be unique
description: "Optional, shown under the institution."
---
```

**Brand colors, fonts and spacing** are in `src/styles/tokens.css`. Change a token there and every section picks it up. The site is always shown in light mode.

**Copy for the hero, about and contact details** is written directly in the matching component in `src/components/`.

## Testing

| Layer | Location | Covers |
|---|---|---|
| Unit | `tests/unit/` | Contact endpoint: required fields, length limits, email format, honeypot, JSON and form-data bodies, 400/405/200 responses |
| Component | `tests/components/` | Each component rendered with Astro's test container: content order, nav anchors, form field contract, labels, SEO meta and JSON-LD |
| End-to-end | `tests/e2e/` | Nav scrolling, mobile menu, console errors, horizontal overflow, hero video, served assets, browser form validation, sitemap |

CI (`.github/workflows/ci.yml`) runs the type check, the coverage run and the Playwright tests on every push and pull request. Each push to `main` also updates the coverage badge. The badge data lives on the `badges` branch, and CI overwrites that branch on every run.

### Known gaps

Some tests are written to **expect a failure** (`test.fails` / `test.fail()`). Each one describes a known bug and passes as long as that bug is still there. Once the bug is fixed, the test starts failing: change it to a normal `test` at that point.

| Gap | Test |
|---|---|
| The page has no `<title>` element | `tests/components/index.test.ts` |
| The contact form has no `website` honeypot input | `tests/components/Contact.test.ts` |
| `/api/contact` isn't served (see Deployment) | `tests/e2e/contact.spec.ts` |
| `hero-poster.jpg` and `og-default.png` are referenced but missing | `tests/e2e/page.spec.ts` |

### Gotchas

- **Content in tests:** under Vitest, `astro:content` reads `.astro/data-store.json`, but `astro build` and `astro sync` write the store to `node_modules/.astro/`. `tests/setup/sync-content.ts` re-syncs into `.astro/` before every run, so the tests always see the current content.
- **Vitest skips `astro.config.mjs`.** The Cloudflare adapter starts a Miniflare process that keeps Vitest from exiting. See `vitest.config.ts`.
- **No 404 page:** Pages answers unknown paths with `index.html` and status 200. To check whether a file exists, test its `content-type`, not the status.

## Deployment

Deployed to Cloudflare Pages from the built `dist/` directory, at `https://itzaestrada.com` (set in `astro.config.mjs`).

> ⚠️ The Cloudflare adapter emits `dist/_worker.js`. When that file exists, Pages **ignores** the `functions/` directory, so `functions/api/contact.ts` isn't deployed and form submissions fall through to the homepage. To fix it, move the endpoint to an Astro API route (`src/pages/api/contact.ts` with `export const prerender = false`) or remove the adapter. The endpoint currently only logs submissions. It doesn't send email yet.
