# Styles

## Fonts

- Project fonts: Switzer, Cormorant Garamond, Inter, Inter Display
- Custom (uploaded) font: Nyght Serif

Text style font families: Cormorant Garamond (55), Inter (19), Switzer (1)

## Color styles

| Path | Light | Dark |
|---|---|---|
| /Colors/Header Color | rgb(219, 219, 219) |  |
| /Colors/Grey Background | rgb(15, 15, 15) |  |
| /Colors/Dark Background | rgb(0, 0, 0) |  |
| /Colors/Paragraph Color | rgb(194, 194, 194) |  |
| /Colors/Border | rgb(54, 54, 54) |  |
| /Colors/Black | rgb(0, 0, 0) |  |
| /Colors/Heading Color | rgb(33, 33, 33) | rgb(240, 240, 240) |
| /Colors/Paragraph Color | rgb(69, 69, 69) | rgb(148, 148, 148) |
| /Colors/White | rgb(255, 255, 255) |  |
| /Colors/Cream | rgb(245, 242, 235) |  |
| /Colors/Blake Ward/BG Cream | rgb(244, 241, 234) |  |
| /Colors/Blake Ward/Ink | rgb(28, 26, 23) |  |
| /Colors/Blake Ward/Muted | rgb(111, 106, 97) |  |
| /Colors/Blake Ward/Line | rgb(216, 210, 198) |  |
| /Colors/Blake Ward/Frame | rgb(233, 228, 217) |  |
| /Colors/Blake Ward/Footer BG | rgb(28, 26, 23) |  |
| /Colors/Blake Ward/Footer Text | rgb(207, 201, 189) |  |
| /Colors/Blake Ward/Footer Label | rgb(138, 131, 117) |  |
| /Colors/Blake Ward/Footer Rule | rgb(52, 48, 42) |  |
| /Colors/highlight | rgb(227, 202, 166) |  |
| /Colors/highlight DARKER | rgb(204, 164, 108) |  |
| /Colors/Both works | rgb(92, 88, 82) |  |

## Text styles

Values are size / line height / tracking (psN = paragraph spacing), copied raw from the Framer API. CAUTION: every style has base minWidth 0 plus breakpoint entries at minWidth 1400 and 810. Framer orders text-style breakpoints largest minWidth first with the base normally being the largest, so a base of 0 is unusual; read literally it means >=1400 uses the 1400 column, 810 to 1399 the 810 column, and below 810 the base column. Verify against the live site before relying on the phone column (e.g. XXL base is 100px).

| Path | Tag | Font | Weight/style | Base (minWidth 0) | minWidth 810 | minWidth 1400 | Color | Transform | Align |
|---|---|---|---|---|---|---|---|---|---|
| /Text Styles/Heading 1 | h1 | Cormorant Garamond | 400 normal | 50px / 1.1em / -0.06em | 37px / 1.1em / -0.06em | 40px / 1.1em / -0.06em | Header Color | none | left |
| /Text Styles/XXL | h1 | Cormorant Garamond | 400 normal | 100px / 1.1em / -0.06em | 60px / 1.1em / -0.06em | 90px / 1.1em / -0.06em | Header Color | none | left |
| /Text Styles/Jumbo | h1 | Cormorant Garamond | 300 normal | 65px / 1.1em / -0.06em | 45px / 1.1em / -0.06em | 55px / 1.1em / -0.06em | Header Color | none | left |
| /Text Styles/Heading 2 | h2 | Cormorant Garamond | 300 normal | 40px / 1.2em / -0.04em ps40 | 32px / 1.2em / -0.04em ps40 |  | Header Color | none | left |
| /Text Styles/Heading 3 | h3 | Cormorant Garamond | 300 normal | 34px / 1.2em / -0.04em ps40 | 25px / 1.2em / -0.04em ps40 | 29px / 1.2em / -0.04em ps40 | Header Color | none | left |
| /Text Styles/Heading 4 | h4 | Cormorant Garamond | 300 normal | 26px / 1.4em / -0.04em ps40 | 19px / 1.4em / -0.04em ps40 | 21px / 1.4em / -0.04em ps40 | Header Color | none | left |
| /Text Styles/Heading 5 | h5 | Cormorant Garamond | 400 normal | 18px / 1.4em / -0.04em ps40 | 13px / 1.4em / -0.04em ps40 | 14px / 1.4em / -0.04em ps40 | Header Color | none | left |
| /Text Styles/Heading 6 | h6 | Cormorant Garamond | 400 normal | 16px / 1.4em / -0.02em ps40 | 14px / 1.4em / -0.02em ps40 | 15px / 1.4em / -0.02em ps40 | Header Color | none | left |
| /Text Styles/Body | p | Switzer | 300 normal | 18px / 1.6em / -0.04em ps20 | 13px / 1.6em / -0.04em ps20 | 14px / 1.6em / -0.04em ps20 | Paragraph Color | none | left |
| /Text Styles/Body S | p | Cormorant Garamond | 300 normal | 13px / 1.6em / -0.02em ps20 | 12px / 1.6em / -0.02em ps20 |  | Paragraph Color | none | left |
| /Text Styles/Body L | p | Cormorant Garamond | 300 normal | 20px / 1.6em / -0.02em ps20 | 16px / 1.6em / -0.02em ps20 | 18px / 1.6em / -0.02em ps20 | Paragraph Color | none | left |
| /Text Styles/Blake Ward/Eyebrow | p | Inter | 300 normal | 14px / 1.6em / 3.4px ps20 |  |  | Cream | uppercase | left |
| /Text Styles/Blake Ward/Hero Title | h1 | Cormorant Garamond | 500 normal | 104px / 0.98em / 1px | 52px / 0.98em / 1px | 72px / 0.98em / 1px | #000 | none | left |
| /Text Styles/Blake Ward/Hero Tagline | p | Cormorant Garamond | 400 italic | 24px / 1.4em / -0.02em ps20 | 18px / 1.4em / -0.02em ps20 | 21px / 1.4em / -0.02em ps20 | #666 | none | left |
| /Text Styles/Blake Ward/Statement | p | Cormorant Garamond | 400 italic | 38px / 1.35em / -0.02em ps20 | 24px / 1.35em / -0.02em ps20 | 30px / 1.35em / -0.02em ps20 | #666 | none | left |
| /Text Styles/Blake Ward/Section Title | h2 | Cormorant Garamond | 500 normal | 54px / 1.1em / 0.5px ps40 | 34px / 1.1em / 0.5px ps40 | 44px / 1.1em / 0.5px ps40 | #000 | none | left |
| /Text Styles/Blake Ward/Lead | p | Cormorant Garamond | 400 italic | 26px / 1.35em / -0.02em ps20 |  |  | #666 | none | left |
| /Text Styles/Blake Ward/Body | p | Inter | 300 normal | 16px / 1.6em / -0.02em ps20 |  |  | Footer Label | none | left |
| /Text Styles/Blake Ward/Small | p | Inter | 300 normal | 14.5px / 1.6em / -0.02em ps20 |  |  | #666 | none | left |
| /Text Styles/Blake Ward/Year | p | Cormorant Garamond | 600 normal | 22px / 1.3em / -0.02em ps20 |  |  | Cream | none | left |
| /Text Styles/Blake Ward/Card Title | h3 | Cormorant Garamond | 500 normal | 28px / 1.2em / -0.04em ps40 |  |  | #000 | none | left |
| /Text Styles/Blake Ward/Country | p | Cormorant Garamond | 400 normal | 22px / 1.4em / -0.02em ps20 |  |  | #666 | none | left |
| /Text Styles/Blake Ward/Stat Number | p | Cormorant Garamond | 600 normal | 52px / 1em / -0.02em ps20 | 42px / 1em / -0.02em ps20 | 52px / 1em / -0.02em ps20 | #666 | none | left |
| /Text Styles/Blake Ward/CTA Title | h2 | Cormorant Garamond | 500 normal | 52px / 1.15em / -0.04em ps40 | 32px / 1.15em / -0.04em ps40 | 42px / 1.15em / -0.04em ps40 | #000 | none | left |
| /Text Styles/Article/Heading 1 | h1 | Cormorant Garamond | 500 normal | 46px / 1.15em / 0.4px | 32px / 1.15em / 0.4px | 38px / 1.15em / 0.4px | Header Color | none | left |
| /Text Styles/Article/Heading 2 | h2 | Cormorant Garamond | 500 normal | 34px / 1.2em / 0.3px ps40 | 26px / 1.2em / 0.3px ps40 | 30px / 1.2em / 0.3px ps40 | Header Color | none | left |
| /Text Styles/Article/Heading 3 | h3 | Cormorant Garamond | 500 normal | 27px / 1.25em / -0.04em ps40 | 23px / 1.25em / -0.04em ps40 | 25px / 1.25em / -0.04em ps40 | Header Color | none | left |
| /Text Styles/Article/Heading 4 | h4 | Cormorant Garamond | 600 normal | 22px / 1.3em / -0.04em ps40 |  |  | Header Color | none | left |
| /Text Styles/Article/Heading 5 | h5 | Cormorant Garamond | 600 normal | 19px / 1.35em / -0.04em ps40 |  |  | Header Color | none | left |
| /Text Styles/Article/Heading 6 | h6 | Cormorant Garamond | 600 normal | 17px / 1.4em / -0.02em ps40 |  |  | Header Color | none | left |
| /Text Styles/Article/Body | p | Inter | 300 normal | 17px / 1.75em / -0.02em ps20 | 16px / 1.75em / -0.02em ps20 | 17px / 1.75em / -0.02em ps20 | Paragraph Color | none | left |
| /Text Styles/Article/Lead | p | Inter | 300 normal | 20px / 1.7em / -0.02em ps20 | 18px / 1.7em / -0.02em ps20 | 19px / 1.7em / -0.02em ps20 | Paragraph Color | none | left |
| /Text Styles/Article/Small | p | Inter | 400 normal | 14px / 1.6em / 0.3px ps20 |  |  | Paragraph Color | none | left |
| /Text Styles/Article/Label | p | Inter | 400 normal | 12px / 1.6em / 1.8px ps20 |  |  | Header Color | uppercase | left |
| /Text Styles/Article/Meta Value | p | Inter | 300 normal | 16px / 1.6em / -0.02em ps20 |  |  | Paragraph Color | none | left |
| /Text Styles/Article Light/Heading 1 | h1 | Cormorant Garamond | 500 normal | 46px / 1.15em / 0.4px | 32px / 1.15em / 0.4px | 38px / 1.15em / 0.4px | Ink | none | left |
| /Text Styles/Article Light/Heading 2 | h2 | Cormorant Garamond | 500 normal | 34px / 1.2em / 0.3px ps40 | 26px / 1.2em / 0.3px ps40 | 30px / 1.2em / 0.3px ps40 | Ink | none | left |
| /Text Styles/Article Light/Heading 3 | h3 | Cormorant Garamond | 500 normal | 27px / 1.25em / -0.04em ps40 | 23px / 1.25em / -0.04em ps40 | 25px / 1.25em / -0.04em ps40 | Ink | none | left |
| /Text Styles/Article Light/Heading 4 | h4 | Cormorant Garamond | 600 normal | 22px / 1.3em / -0.04em ps40 |  |  | Ink | none | left |
| /Text Styles/Article Light/Heading 5 | h5 | Cormorant Garamond | 600 normal | 19px / 1.35em / -0.04em ps40 |  |  | Ink | none | left |
| /Text Styles/Article Light/Heading 6 | h6 | Cormorant Garamond | 600 normal | 17px / 1.4em / -0.02em ps40 |  |  | Ink | none | left |
| /Text Styles/Article Light/Body | p | Inter | 300 normal | 17px / 1.75em / -0.02em ps20 | 16px / 1.75em / -0.02em ps20 | 17px / 1.75em / -0.02em ps20 | Ink | none | left |
| /Text Styles/Article Light/Lead | p | Inter | 300 normal | 20px / 1.7em / -0.02em ps20 | 18px / 1.7em / -0.02em ps20 | 19px / 1.7em / -0.02em ps20 | Ink | none | left |
| /Text Styles/Article Light/Small | p | Inter | 400 normal | 14px / 1.6em / 0.3px ps20 |  |  | Ink | none | left |
| /Text Styles/Article Light/Label | p | Inter | 400 normal | 12px / 1.6em / 1.8px ps20 |  |  | Ink | uppercase | left |
| /Text Styles/Article Light/Meta Value | p | Inter | 300 normal | 16px / 1.6em / -0.02em ps20 |  |  | Ink | none | left |
| /Text Styles/Blake Ward/Statement Inverse | p | Cormorant Garamond | 400 italic | 38px / 1.35em / -0.02em ps20 | 24px / 1.35em / -0.02em ps20 | 30px / 1.35em / -0.02em ps20 | rgb(245, 242, 235) | none | left |
| /Text Styles/Blake Ward/Body Inverse | p | Inter | 300 normal | 16px / 1.6em / -0.02em ps20 |  |  | rgb(245, 242, 235) | none | left |
| /Text Styles/Blake Ward/Section Title Inverse | h2 | Cormorant Garamond | 500 normal | 54px / 1.1em / 0.5px ps40 | 34px / 1.1em / 0.5px ps40 | 44px / 1.1em / 0.5px ps40 | rgb(245, 242, 235) | none | left |
| /Text Styles/Blake Ward/Body Inverse H4 | h4 | Inter | 300 normal | 16px / 1.6em / -0.02em ps20 |  |  | rgb(245, 242, 235) | none | left |
| /Text Styles/Blake Ward/Hero Title Inverse | h1 | Cormorant Garamond | 500 normal | 104px / 0.98em / 1px | 52px / 0.98em / 1px | 72px / 0.98em / 1px | rgb(245, 242, 235) | none | left |
| /Text Styles/Blake Ward/Hero Tagline Inverse | p | Cormorant Garamond | 400 italic | 24px / 1.4em / -0.02em ps20 | 18px / 1.4em / -0.02em ps20 | 21px / 1.4em / -0.02em ps20 | rgb(180, 174, 163) | none | left |
| /Text Styles/Blake Ward/Lead Inverse | p | Cormorant Garamond | 400 italic | 26px / 1.35em / -0.02em ps20 |  |  | rgb(180, 174, 163) | none | left |
| /Text Styles/Blake Ward/Small Inverse | p | Inter | 300 normal | 14.5px / 1.6em / -0.02em ps20 |  |  | rgb(180, 174, 163) | none | left |
| /Text Styles/Blake Ward/Card Title Inverse | h3 | Cormorant Garamond | 500 normal | 28px / 1.2em / -0.04em ps40 |  |  | rgb(245, 242, 235) | none | left |
| /Text Styles/Blake Ward/Country Inverse | p | Cormorant Garamond | 400 normal | 22px / 1.4em / -0.02em ps20 |  |  | rgb(180, 174, 163) | none | left |
| /Text Styles/Blake Ward/Stat Number Inverse | p | Cormorant Garamond | 600 normal | 52px / 1em / -0.02em ps20 | 42px / 1em / -0.02em ps20 | 52px / 1em / -0.02em ps20 | rgb(245, 242, 235) | none | left |
| /Text Styles/Blake Ward/CTA Title Inverse | h2 | Cormorant Garamond | 500 normal | 52px / 1.15em / -0.04em ps40 | 32px / 1.15em / -0.04em ps40 | 42px / 1.15em / -0.04em ps40 | rgb(245, 242, 235) | none | left |
| /Text Styles/Blake Ward/Body H4 | h4 | Inter | 300 normal | 16px / 1.6em / -0.02em ps20 |  |  | #666 | none | left |
| /Text Styles/Article/Heading 1 Light | h1 | Cormorant Garamond | 500 normal | 46px / 1.15em / 0.4px | 32px / 1.15em / 0.4px | 38px / 1.15em / 0.4px | rgb(28, 26, 23) | none | left |
| /Text Styles/Heading 4 Light | h4 | Cormorant Garamond | 300 normal | 26px / 1.4em / -0.04em ps40 | 19px / 1.4em / -0.04em ps40 | 21px / 1.4em / -0.04em ps40 | rgb(28, 26, 23) | none | left |
| /Text Styles/Heading 5 Light | h5 | Cormorant Garamond | 400 normal | 18px / 1.4em / -0.04em ps40 | 13px / 1.4em / -0.04em ps40 | 14px / 1.4em / -0.04em ps40 | rgb(111, 106, 97) | none | left |
| /Text Styles/Article/Body Light | p | Inter | 300 normal | 17px / 1.75em / -0.02em ps20 | 16px / 1.75em / -0.02em ps20 | 17px / 1.75em / -0.02em ps20 | rgb(111, 106, 97) | none | left |
| /Text Styles/Article/Heading 2 Light | h2 | Cormorant Garamond | 500 normal | 34px / 1.2em / 0.3px ps40 | 26px / 1.2em / 0.3px ps40 | 30px / 1.2em / 0.3px ps40 | rgb(28, 26, 23) | none | left |
| /Text Styles/Article/Heading 3 Light | h3 | Cormorant Garamond | 500 normal | 27px / 1.25em / -0.04em ps40 | 23px / 1.25em / -0.04em ps40 | 25px / 1.25em / -0.04em ps40 | rgb(28, 26, 23) | none | left |
| /Text Styles/Heading 6 Light | h6 | Cormorant Garamond | 400 normal | 16px / 1.4em / -0.02em ps40 | 14px / 1.4em / -0.02em ps40 | 15px / 1.4em / -0.02em ps40 | rgb(111, 106, 97) | none | left |
| /Text Styles/Article/Heading 1 Inverse | h1 | Cormorant Garamond | 500 normal | 46px / 1.15em / 0.4px | 32px / 1.15em / 0.4px | 38px / 1.15em / 0.4px | rgb(245, 242, 235) | none | left |
| /Text Styles/Article/Heading 2 Inverse | h2 | Cormorant Garamond | 500 normal | 34px / 1.2em / 0.3px ps40 | 26px / 1.2em / 0.3px ps40 | 30px / 1.2em / 0.3px ps40 | rgb(245, 242, 235) | none | left |
| /Text Styles/Article/Heading 3 Inverse | h3 | Cormorant Garamond | 500 normal | 27px / 1.25em / -0.04em ps40 | 23px / 1.25em / -0.04em ps40 | 25px / 1.25em / -0.04em ps40 | rgb(245, 242, 235) | none | left |
| /Text Styles/Heading 4 Inverse | h4 | Cormorant Garamond | 300 normal | 26px / 1.4em / -0.04em ps40 | 19px / 1.4em / -0.04em ps40 | 21px / 1.4em / -0.04em ps40 | rgb(245, 242, 235) | none | left |
| /Text Styles/Heading 5 Inverse | h5 | Cormorant Garamond | 400 normal | 18px / 1.4em / -0.04em ps40 | 13px / 1.4em / -0.04em ps40 | 14px / 1.4em / -0.04em ps40 | rgb(180, 174, 163) | none | left |
| /Text Styles/Heading 6 Inverse | h6 | Cormorant Garamond | 400 normal | 16px / 1.4em / -0.02em ps40 | 14px / 1.4em / -0.02em ps40 | 15px / 1.4em / -0.02em ps40 | rgb(180, 174, 163) | none | left |
| /Text Styles/Article/Body Inverse | p | Inter | 300 normal | 17px / 1.75em / -0.02em ps20 | 16px / 1.75em / -0.02em ps20 | 17px / 1.75em / -0.02em ps20 | rgb(180, 174, 163) | none | left |
| /Text Styles/Article/Statement Inverse | p | Cormorant Garamond | 400 italic | 38px / 1.35em / -0.02em ps20 | 24px / 1.35em / -0.02em ps20 | 30px / 1.35em / -0.02em ps20 | rgb(245, 242, 235) | none | left |
| /Text Styles/Article/Heading 1 OnCream | h1 | Cormorant Garamond | 500 normal | 46px / 1.15em / 0.4px | 32px / 1.15em / 0.4px | 38px / 1.15em / 0.4px | rgb(28, 26, 23) | none | left |

Raw data with font file URLs: `structure/_styles-raw.json`.