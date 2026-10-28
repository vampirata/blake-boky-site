# Blake & Boky

Coded rebuild of [blakeandboky.com](https://blakeandboky.com) (previously Framer), built with Astro as a static site.

## Run

```bash
pnpm install
pnpm dev        # http://localhost:4400
pnpm build      # static output in dist/
```

## Content (CMS)

All CMS content lives as JSON in `src/content/data/`. Each collection renders its own index and detail pages:

| Collection | File | Pages |
| --- | --- | --- |
| Collections | `collections.json` | `/collections`, `/collections/<slug>` |
| Works | `works.json` | `/collections/<collection>/<work>` |
| Past works | `past-works.json` | `/past-works`, `/past-works/<slug>` |
| News | `news.json` | `/news`, `/news/<slug>` |
| Galleries | `galleries.json` | `/galleriespetley`, `/galleriespetley/<slug>` |

Add or edit an entry, run `pnpm build`, and the pages, sitemap and navigation update. Images go in `public/assets/`.

## Deploy

Cloudflare Pages project `blake-boky`:

```bash
pnpm build && npx wrangler pages deploy dist --project-name blake-boky
```

## Docs

- `docs/design-spec.md`: measured tokens, type scale and layout per template
- `docs/framer/`: structure read from the original Framer project
- `docs/extract-*-notes.md`: content extraction notes, gaps and client typos kept as found
