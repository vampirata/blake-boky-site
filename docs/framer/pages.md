# Pages

All pages share 3 breakpoints:

| Breakpoint | Canvas width | Media query |
|---|---|---|
| Desktop (primary) | 1400px | (min-width: 1400px) |
| Tablet | 810px | (min-width: 810px) and (max-width: 1399.98px) |
| Phone | 390px | (max-width: 809.98px) |

Layout templates: `Default Template` (CWeg27bi1, nav + footer, has a NAV BAR TOGGLE control choosing the Navigation component variant), `Page Template` (eh2wp0pmv). Desktop tree of the default template: `structure/_layout-template-desktop.json`.

| Path | Name | Draft | CMS detail of | Layout template | Nav variant | Desktop bp id | SEO title |
|---|---|---|---|---|---|---|---|
| `/` | Home |  |  | Default Template | Desktop BLACK | WQLkyLRf1 | Blake Ward & Boky Hackel-Ward — Sculpture |
| `/404` | /404 |  |  | Default Template | Desktop Light | rVi64A0Wu |  |
| `/blake-bio` | /blake-bio |  |  | Default Template | Desktop Light | Rk6T6FIxO | Blake Ward — Sculptor |
| `/boky-bio` | /boky-bio |  |  | Default Template | DESKTOP GREY | EqbZlBfoj | Boky Hackel-Ward — Sculptor |
| `/collections` | /collections |  |  | Page Template |  | X9uhlxZhH | Collections — Blake & Boky |
| `/collections/andromeda` | /collections/andromeda |  |  | Default Template | Desktop Light | SPbdMWafH | Andromeda — Blake & Boky |
| `/collections/andromeda/:Andromeda` | /collections/andromeda/:Andromeda |  | Andromeda | Default Template | Desktop Light | jBY_U38x7 | {{Title}} - Zilo — Framer Template by Sidebay Supply |
| `/collections/coming-soon-blake` | /collections/coming-soon-blake |  |  | Default Template | Desktop Light | XUzx6fIcc | Coming Soon — Blake Ward |
| `/collections/coming-soon-boky` | /collections/coming-soon-boky |  |  | Default Template | DESKTOP GREY | YUEjpaWOq | Coming Soon — Boky Hackel-Ward |
| `/collections/figurative-poetry` | /collections/figurative-poetry |  |  | Default Template | DESKTOP GREY | ahuXSg4as | Figurative Poetry — Boky Hackel-Ward |
| `/collections/figurative-poetry/:Figurative Poetry indiv-indiv` | /collections/figurative-poetry/:Figurative Poetry indiv-indiv |  | Figurative Poetry indiv | Default Template | DESKTOP GREY | fApOdwJpu | {{Title}} — Figurative Poetry |
| `/collections/fragments` | /collections/fragments |  |  | Default Template | Desktop Light | JDsJ1m8eb | Fragments — Blake Ward |
| `/collections/fragments/:Fragments` | /collections/fragments/:Fragments |  | Fragments | Default Template | Desktop Light | lMmMmUN6r | {{Title}} - Zilo — Framer Template by Sidebay Supply |
| `/collections/in-lucem` | /collections/in-lucem |  |  | Default Template | DESKTOP GREY | CJJ1Jx9jm | In Lucem — Boky Hackel-Ward |
| `/collections/in-lucem/:In Lucem indiv-indiv` | /collections/in-lucem/:In Lucem indiv-indiv |  | In Lucem indiv | Default Template | Desktop BLACK | QZ6r98jX5 | {{Title}} — In Lucem |
| `/collections/spirit-collection` | /collections/spirit-collection |  |  | Default Template | Desktop BLACK | EnRJTsGyk | Spirit Collection — Blake & Boky |
| `/collections/spirit-collection/:Spirit Collection` | /collections/spirit-collection/:Spirit Collection |  | Spirit Collection | Default Template | Desktop BLACK | hbP0PBc8I | {{Title}} - Zilo — Framer Template by Sidebay Supply |
| `/contact` | /contact |  |  | Default Template | Desktop Light | yOoAd8IFC | Contact — Blake & Boky |
| `/galler` | /galler | yes |  | Default Template | Desktop Light | AlWKDEVjH | Petley Jones Gallery — Blake & Boky |
| `/galleriespetley` | /galleriespetley |  |  | Default Template | Desktop Light | K2vXbg6HA | Petley Jones Gallery — Blake & Boky |
| `/galleriespetley/:Galleries` | /galleriespetley/:Galleries |  | Galleries | Default Template | Desktop Light | kZgXMnua6 | {{Title}} — Blake & Boky |
| `/news` | /news |  |  | Page Template |  | FWCuvAtz4 | News — Blake & Boky |
| `/news/:News` | /news/:News |  | News | Default Template | Desktop Light | rQlqri_w0 | {{Title}} — Blake & Boky |
| `/past-works` | /past-works |  |  | Page Template |  | wbrDyJg64 | Past Works — Boky Hackel-Ward |
| `/past-works/:Past Works` | /past-works/:Past Works |  | Past Works | Default Template | DESKTOP GREY | RkffV0qYJ | Past Works — Boky Hackel-Ward |
| `/trial` | /trial | yes |  | Default Template | DESKTOP GREY | nd9HemRIS | Spirit Collection — Blake & Boky |

Notes:
- `/trial` and `/galler` are draft (unpublished) pages.
- Galleries live at `/galleriespetley` (sic), detail `/galleriespetley/:slug`.
- In Lucem and Figurative Poetry detail paths contain `indiv-indiv` in the Framer route name; the live slug segment is the item slug.
- `/collections/coming-soon-blake` and `/collections/coming-soon-boky` are static placeholder pages.

Full page metadata: see `structure/_pages-raw.json`.