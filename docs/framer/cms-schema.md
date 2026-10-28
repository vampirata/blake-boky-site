# CMS schema (Framer, Blake & Boky Official)

Read-only export, 28 Oct 2026. Source of truth: the Framer project. Item files in `cms-items/`.

Every collection has an auto Slug field generated from Title. `draft` on an item means it is excluded from the published site.

## Collections

- Items: 14 total, 1 draft (Framer reports $itemCount 13)
- Detail page: none
- Slug field: Slug (auto from Title)
- Items file: `cms-items/collections.json`

| Field | Type | Required | Notes |
|---|---|---|---|
| Title (`$control__title`) | string | False |  |
| Slug (`$control__slug`) | string |  |  |
| Category (`$control__category`) | option |  | options: 'Collaborative ', 'Blake Ward', 'Boky Hackel', 'Past shows', 'Public Installations ', ''; default "Collaborative " |
| Year (`$control__year`) | string | False | default "2025" |
| Size (`$control__size`) | string | False |  |
| Medium (`$control__medium`) | string | False |  |
| _Texts (divider)_ | | | |
| Intro (`$control__intro`) | richtext | False |  |
| Middle Text (`$control__middle_text`) | richtext | False |  |
| Credits (`$control__credits`) | richtext | False |  |
| _Layout (divider)_ | | | |
| Full Width Layout (`$control__full_width_layout`) | boolean |  | default false |
| _Images (divider)_ | | | |
| Lora from Another Land (`$control__lora_from_another_land`) | image | False |  |
| MAYA marble (`$control__maya_marble`) | image | False |  |
| ushabti ryuu (`$control__ushabti_ryuu`) | image | False |  |
| Sharon Marble (`$control__sharon_marble`) | image | False |  |
| Marble Larkin (`$control__marble_larkin`) | image | False |  |
| Next Project (`$control__next_project`) | single | True | references collection **Collections** (single) |
| Link (`$control__link`) | link | False |  |
| One Collection (`$control__one_collection`) | option |  | options: 'Spirit', 'none'; default "Spirit" |
| Image 6 (`$control__image_6`) | image | False |  |
| id (`$control__id`) | string |  |  |

Draft items: conceptual-works

## News

- Items: 9 total, 4 draft (Framer reports $itemCount 8)
- Detail page: `/news/:News`
- Slug field: Slug (auto from Title)
- Items file: `cms-items/news.json`

| Field | Type | Required | Notes |
|---|---|---|---|
| Title (`$control__title`) | string | False |  |
| Slug (`$control__slug`) | string |  |  |
| Date (`$control__date`) | date | False | date only |
| Image (`$control__image`) | image | False | default "data:framer/asset-reference,nqmH3M4mUIKVh6qYxfkrlDCD1A.jpeg?originalFilename=nl |
| Content (`$control__content`) | richtext | False |  |
| Link (`$control__link`) | link | False |  |
| publik link (`$control__publik_link`) | link | False |  |
| youtube link (`$control__youtube_link`) | link | False |  |
| id (`$control__id`) | string |  |  |

Draft items: artnet-publication, blake-et-boky-une-histoire-d-art-et-d-amour, le-litteraire-de-l-inexistence-des-elfes-au-zeitgeist-de-la-figure, aRKohcBW0

## Galleries

- Items: 6 total, 2 draft (Framer reports $itemCount 6)
- Detail page: `/galleriespetley/:Galleries`
- Slug field: Slug (auto from Title)
- Items file: `cms-items/galleries.json`

| Field | Type | Required | Notes |
|---|---|---|---|
| Title (`$control__title`) | string | False |  |
| Slug (`$control__slug`) | string |  |  |
| Date (`$control__date`) | date | False | date only |
| Location (`$control__location`) | string | False |  |
| Gallery Rep (`$control__gallery_rep`) | string | False |  |
| Image (`$control__image`) | image | False |  |
| Curatorial Statement (`$control__curatorial_statement`) | richtext | False |  |
| Image 2 (`$control__image_2`) | image | False |  |
| Content 1 (`$control__content_1`) | richtext | False |  |
| File (`$control__file`) | file | False |  |
| Link (`$control__link`) | link | False |  |
| Link 2 (`$control__link_2`) | link | False |  |
| Image 3 (`$control__image_3`) | image | False |  |
| Image 4 (`$control__image_4`) | image | False |  |
| id (`$control__id`) | string |  |  |

Draft items: monaco-one-masters, art-dubai-digital-2025

## Spirit Collection

- Items: 22 total, 8 draft (Framer reports $itemCount 21)
- Detail page: `/collections/spirit-collection/:Spirit Collection`
- Slug field: Slug (auto from Title)
- Items file: `cms-items/spirit-collection.json`

| Field | Type | Required | Notes |
|---|---|---|---|
| Title (`$control__title`) | string | False |  |
| Slug (`$control__slug`) | string |  |  |
| Name 1 (`$control__name_1`) | string | False |  |
| Content (`$control__content`) | richtext | False |  |
| Gallery (`$control__gallery`) | array | True | list of Image (image), min 4 |
| Content 2 (`$control__content_2`) | richtext | False |  |
| Image 1 (`$control__image_1`) | image | False |  |
| Image 2 (`$control__image_2`) | image | False |  |
| Image 3 (`$control__image_3`) | image | False |  |
| Image 4 (`$control__image_4`) | image | False |  |
| Image 5 (`$control__image_5`) | image | False |  |
| Image 6 (`$control__image_6`) | image | False |  |
| Image 7 (`$control__image_7`) | image | False |  |
| Image 8 (`$control__image_8`) | image | False |  |
| Image 9 (`$control__image_9`) | image | False |  |
| Image 10 (`$control__image_10`) | image | False |  |
| Image 11 (`$control__image_11`) | image | False |  |
| Image 12 (`$control__image_12`) | image | False |  |
| id (`$control__id`) | string |  |  |

Draft items: angel-ramiel, goddess-ma-at, angel-camael, angel-hamiah, angel-assiel, angel-ishtar, angel-daniel, angel-azrael

## Fragments

- Items: 12 total, 8 draft (Framer reports $itemCount 11)
- Detail page: `/collections/fragments/:Fragments`
- Slug field: Slug (auto from Title)
- Items file: `cms-items/fragments.json`

| Field | Type | Required | Notes |
|---|---|---|---|
| Title (`$control__title`) | string | False |  |
| Slug (`$control__slug`) | string |  |  |
| Content (`$control__content`) | richtext | False |  |
| Gallery (`$control__gallery`) | array | False | list of Image (image) |
| Content 2 (`$control__content_2`) | richtext | False |  |
| Image 1 (`$control__image_1`) | image | False |  |
| Image 2 (`$control__image_2`) | image | False |  |
| Image 3 (`$control__image_3`) | image | False |  |
| Image 4 (`$control__image_4`) | image | False |  |
| Image 5 (`$control__image_5`) | image | False |  |
| Image 6 (`$control__image_6`) | image | False |  |
| Image 7 (`$control__image_7`) | image | False |  |
| Image 8 (`$control__image_8`) | image | False |  |
| Image 9 (`$control__image_9`) | image | False |  |
| Image 10 (`$control__image_10`) | image | False |  |
| Image 11 (`$control__image_11`) | image | False |  |
| Link (`$control__link`) | link | False |  |
| id (`$control__id`) | string |  |  |

Draft items: fragment-putkimiina-m-68, fragments-scatmine-blu-92, fragments-suu-58, fragment-hornet-m93, fragment-hamdy-hak-1, apple-p-40, fragment-butterfly-pfm-1, gatorman

## Andromeda

- Items: 3 total, 0 draft (Framer reports $itemCount 3)
- Detail page: `/collections/andromeda/:Andromeda`
- Slug field: Slug (auto from Title)
- Items file: `cms-items/andromeda.json`

| Field | Type | Required | Notes |
|---|---|---|---|
| Title (`$control__title`) | string | False |  |
| Slug (`$control__slug`) | string |  |  |
| Name (`$control__name`) | string | False |  |
| Content (`$control__content`) | richtext | False |  |
| Gallery (`$control__gallery`) | array | False | list of Image (image) |
| Content 2 (`$control__content_2`) | richtext | False |  |
| Image 1 (`$control__image_1`) | image | False |  |
| Image 2 (`$control__image_2`) | image | False |  |
| Image 3 (`$control__image_3`) | image | False |  |
| Image 4 (`$control__image_4`) | image | False |  |
| Image 5 (`$control__image_5`) | image | False |  |
| Image 6 (`$control__image_6`) | image | False |  |
| Image 7 (`$control__image_7`) | image | False |  |
| Image 8 (`$control__image_8`) | image | False |  |
| Spline link (`$control__spline_link`) | link | False |  |
| id (`$control__id`) | string |  |  |

## In Lucem indiv

- Items: 8 total, 4 draft (Framer reports $itemCount 7)
- Detail page: `/collections/in-lucem/:In Lucem indiv-indiv`
- Slug field: Slug (auto from Title)
- Items file: `cms-items/in-lucem-indiv.json`

| Field | Type | Required | Notes |
|---|---|---|---|
| Title (`$control__title`) | string | False |  |
| Slug (`$control__slug`) | string |  |  |
| Gallery 1 (`$control__gallery_1`) | array | True | list of Image (image), min 1 |
| Content (`$control__content`) | richtext | False |  |
| Image 1 (`$control__image_1`) | image | False |  |
| Image 2 (`$control__image_2`) | image | False |  |
| Image 3 (`$control__image_3`) | image | False |  |
| Image 4 (`$control__image_4`) | image | False |  |
| Image 5 (`$control__image_5`) | image | False |  |
| Image 6 (`$control__image_6`) | image | False |  |
| Image 7 (`$control__image_7`) | image | False |  |
| Image 8 (`$control__image_8`) | image | False |  |
| id (`$control__id`) | string |  |  |

Draft items: studrats, woof, in-lucem-the-steel-studio, fhNnpECKN

## Figurative Poetry indiv

- Items: 6 total, 0 draft (Framer reports $itemCount 6)
- Detail page: `/collections/figurative-poetry/:Figurative Poetry indiv-indiv`
- Slug field: Slug (auto from Title)
- Items file: `cms-items/figurative-poetry-indiv.json`

| Field | Type | Required | Notes |
|---|---|---|---|
| Title (`$control__title`) | string | False |  |
| Slug (`$control__slug`) | string |  |  |
| Content (`$control__content`) | richtext | False |  |
| Content 2 (`$control__content_2`) | richtext | False |  |
| Gallery 1 (`$control__gallery_1`) | array | False | list of Image (image) |
| Content 3 (`$control__content_3`) | richtext | False |  |
| Image 1 (`$control__image_1`) | image | False |  |
| Image 2 (`$control__image_2`) | image | False |  |
| Image 3 (`$control__image_3`) | image | False |  |
| Image 4 (`$control__image_4`) | image | False |  |
| Image 5 (`$control__image_5`) | image | False |  |
| Image 6 (`$control__image_6`) | image | False |  |
| Image 7 (`$control__image_7`) | image | False |  |
| Image 8 (`$control__image_8`) | image | False |  |
| Image 9 (`$control__image_9`) | image | False |  |
| id (`$control__id`) | string |  |  |

## Archive Articles

- Items: 0 total, 0 draft (Framer reports $itemCount 0)
- Detail page: none
- Slug field: Slug (auto from Title)
- Items file: `cms-items/archive-articles.json`

| Field | Type | Required | Notes |
|---|---|---|---|
| Title (`$control__title`) | string | False |  |
| Slug (`$control__slug`) | string |  |  |
| Content (`$control__content`) | richtext | False |  |
| id (`$control__id`) | string |  |  |

## Archive Videos

- Items: 0 total, 0 draft (Framer reports $itemCount 0)
- Detail page: none
- Slug field: Slug (auto from Title)
- Items file: `cms-items/archive-videos.json`

| Field | Type | Required | Notes |
|---|---|---|---|
| Title (`$control__title`) | string | False |  |
| Slug (`$control__slug`) | string |  |  |
| Content (`$control__content`) | richtext | False |  |
| id (`$control__id`) | string |  |  |

## Past Works

- Items: 13 total, 0 draft (Framer reports $itemCount 13)
- Detail page: `/past-works/:Past Works`
- Slug field: Slug (auto from Title)
- Items file: `cms-items/past-works.json`

| Field | Type | Required | Notes |
|---|---|---|---|
| Title (`$control__title`) | string | False |  |
| Slug (`$control__slug`) | string |  |  |
| Content (`$control__content`) | richtext | False |  |
| Year (`$control__year`) | string | False |  |
| Medium (`$control__medium`) | string | False |  |
| Type (`$control__type`) | option |  | options: 'Sculpture', 'Video', 'Press', 'Exhibition' |
| Cover Image (`$control__cover_image`) | image | False |  |
| Image 2 (`$control__image_2`) | image | False |  |
| Image 3 (`$control__image_3`) | image | False |  |
| Image 4 (`$control__image_4`) | image | False |  |
| Video URL (`$control__video_url`) | link | False |  |
| External Link (`$control__external_link`) | link | False |  |
| Credit (`$control__credit`) | string | False |  |
| id (`$control__id`) | string |  |  |

## References between collections

- Collections.Next Project -> Collections (single)

There are no CMS references from works to their collection. Each sculpture series (Spirit Collection, Fragments, Andromeda, In Lucem indiv, Figurative Poetry indiv) is its own CMS collection with its own detail page under `/collections/<series>/:slug`; the series overview pages (`/collections/<series>`) are static pages, and the `Collections` collection (no detail page) holds series cards with Category options and a self reference `Next Project`.
