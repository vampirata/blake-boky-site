# Home fixes

- Hero photo links: three photos had no link (null), one pointed to the malformed `https://collections/the-fragments-collection`, one linked to the home page itself. Now: kneeling torso to `/collections/fragments`; the other unlinked or self linked sculpture photos to `/collections`; the gold faces photo (Boky's gold leaf work) to `/boky-bio`. The two valid links (`/boky-bio`, `/blake-bio`) are kept.
- Hero photo links opened internal pages in a new tab (`target="_blank"`). They now open in the same tab like every other internal link.
- Hero photos were cropped by `object-fit: cover` (6 to 27%). Each frame now takes its image's own ratio, so nothing is cut.
- Hero on tablet and phone: live photos sat partly or fully off screen (x = -193 at 810, x = -637 at 390). Re-laid so all seven stay inside the viewport, no horizontal scroll. Parallax is off on touch devices and with reduced motion.
- Hero photos now have accessible link names (they were empty links).
- Stat counters never settled live (Sculptures made kept counting past 190, others stopped at random values). They now count up once when in view and settle on the endNumber set in the Framer Counter instances: 78+ exhibitions, 12 Collections, 350+ Sculptures made, 29 Countries exhibited in. The first live load showed 50+, 10, 90+, 29, so the client should confirm the stat figures.
- Reduced motion: no parallax, no count animation, final numbers shown. Without JS the final numbers are in the HTML.
- Stats grid images were cut 26 to 28% by cover. Now contained on the stone cell colour, whole sculpture visible.
- Boky portrait cut 25.5% of the head and chin area (centred cover in a square). Focal point set to 50% 15% so her head stays in frame.
- Fullscreen photo of Blake at work lost 59% / 68% of its width on tablet / phone with a centred crop. Focal point moved onto his face and hands (60% 45% tablet, 62% 45% phone).
- Article cards cut the sides of landscape press images (and the "Invoco Te Divina Stella" and "Sculptures Symbolizing Hope" headlines inside them) in a square frame. Now a 4:3 frame with contain on stone.
- Artist names were `h1` (three `h1`s on the page). They are now `h2`; the hero line stays the only `h1`.
- Sticky "Articles" layer: on phone the section is taller than the screen, so a plain `top: 0` would hide its lower cards behind the CTA band. It now sticks by its bottom edge when taller than the viewport.
- Page title: the CMS SEO title contains an em dash ("Blake Ward & Boky Hackel-Ward — Sculpture"); the page uses the site name "Blake & Boky" as its title and keeps the CMS description. Client may want a dash free SEO title.
