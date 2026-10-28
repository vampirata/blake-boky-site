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

## Contact form

Framer's form service only accepts messages from Framer-hosted pages, so the coded site has its own delivery:

- **No key set (default):** Send opens the visitor's email app with the message prefilled to blake@blakeward.com and boky@bokyhackel.com.
- **With a key:** messages are emailed directly, with an on-page thank-you.
  1. Go to https://web3forms.com, enter the email address that should receive messages, and copy the access key it sends you (free).
  2. Build with `PUBLIC_FORM_KEY=<key>` set (locally in a `.env` file, or in the deploy command).
  3. Deploy, then send one test message from /contact.

## Deploy

Static site on Cloudflare (Workers static assets, config in `wrangler.jsonc`). Preview: https://blake-boky.g58tnpr47h.workers.dev

```bash
pnpm run deploy
```

To go live on blakeandboky.com: add the domain to the Worker as a custom domain in Cloudflare, change `SITE` in the `deploy` script to `https://blakeandboky.com` (this also switches robots and the noindex tag to indexable), and redeploy. Old Framer URLs are the same paths, so no redirects are needed.

## What changed from the Framer site

See `docs/fixes.md`: every bug fixed and every open question for the client.

## Docs

- `docs/design-spec.md`: measured tokens, type scale and layout per template
- `docs/framer/`: structure read from the original Framer project
- `docs/extract-*-notes.md`: content extraction notes, gaps and client typos kept as found
