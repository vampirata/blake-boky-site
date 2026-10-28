# Brief for page-building agents

Repo: `/Users/kait/Desktop/Freelance/Blake & Boky/blake-boky-site` (Astro 5, static, pnpm).

Read first: `docs/rebuild-rules.md`, `docs/design-spec.md` (your template's section + sections 1, 2, 4, 5), `docs/framer/` for structure, and the reference screenshots `docs/reference/screens/<template>-<1440|810|390>.png` (open them with the Read tool and compare).

## Shared foundation (do not edit these; ask the lead if something is missing)
- `src/layouts/Base.astro`: props `title, description, ogImage, nav ("black"|"grey"|"light"), bg, fg, smooth, footer`.
- `src/styles/global.css` + `tokens.css`: colour tokens, type roles (`.display .h2 .h3 .detail-title .intro-italic .subtitle .eyebrow .label .micro .body-l .card-title .card-date .prose`), `.container`, `.btn-outline`, `.link`, motion attributes.
- Motion: add `data-reveal` for fade-up-on-scroll, `data-arrive` (+ optional `style="--d:1200ms"`) for header load reveal. `SplitTitle.astro` does per-character titles.
- `Img.astro`: ALL content images. Default = frame takes the image's own ratio and the image is contained, so artwork is never cut. Props: `src` ("/assets/..." exactly as in the JSON), `alt`, `sizes`, `ratio` ("2 / 3"), `fit` ("contain"|"cover"), `pos`, `bg`, `zoom`, `eager`. Use `fit="cover"` only for atmosphere images (banners, CTA backgrounds) and set `pos` to keep the subject. Artwork, sculpture, gallery and card images must show the whole piece: use a fixed `ratio` with `fit="contain"` and `bg` set to the section colour so grids still align.
- `Card.astro` (image + date + split title), `ArriveHeader.astro`, `BackPill.astro`, `CtaBand.astro` (dark pre-footer photo band), `ContactCta.astro` (light pages), `Nav.astro`, `Footer.astro`.
- `src/lib/site.ts`: `url()` for every internal href (handles the deploy base). `src/lib/data.ts`: collections/works loaders, `cleanTitle()`.
- Breakpoints: Desktop `min-width: 1400px`, Tablet `810px to 1399.98px`, Phone `max-width: 809.98px`. Use exactly these.

## Rules
- 1:1 visual match with the live site at 1440, 810, 390. Compare against the screenshots. Measure with the numbers in the spec.
- Fix bugs instead of copying them (wrong back labels, template leftovers in titles, links to unpublished pages, overflow at phone width, cropped artwork). Append each fix as a line to your own file `docs/fixes/<your-area>.md` (the lead merges them).
- Component-scoped `<style>` in each .astro file. Use tokens, not raw hex, except where a one-off measured colour has no token.
- Client copy verbatim. Never write em or en dashes in copy you add.
- Text must never be clipped: display serifs line-height >= 1.04 when an ancestor has overflow hidden.
- Only create/edit the files listed in your task. Never edit package.json or the shared files above. Never run `git commit`; the lead commits.
- Verify: several agents work at once, so never run `astro build` (it would collide on dist/). Run `pnpm exec astro dev --port <your port>` in the background and use Playwright (installed, see `scripts/`) to screenshot your pages at 1440x900, 810x1100, 390x844 and check: no horizontal overflow (`scrollWidth > clientWidth`), no clipped text, no console errors, no 404 requests. Compare side by side with `docs/reference/screens`. Fix until it matches. Kill your preview server when done.
- Report back under 250 words: files created, what matches, what differs and why, fixes made.
