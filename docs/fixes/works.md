# Fixes: artwork detail pages (30 works)

- Page titles: the 20 Andromeda, Spirit and Fragments works were titled "<Name> - Zilo — Framer Template by Sidebay Supply"; the 10 In Lucem and Figurative Poetry works were titled "{{Title}} — In Lucem" or "{{Title}} — Figurative Poetry". Every work page is now titled with the work's own name.
- Descriptions: every work page used the generic site description. Each now uses the first paragraph of the work's own text (trimmed to about 155 characters), or the site default when the work has no text (Angel Angthal, TRAUMTAUB, BROKEN).
- Share image: no work page had an og:image. Each now uses its first gallery image.
- Back link labels: In Lucem works said "Spirit Collection" (but went to In Lucem); Andromeda works said "Andromedas". Both now show the real collection title ("In Lucem", "Andromeda") and link to it.
- Gallery tiles cut the artwork (9:16 frames with cover, up to 74% hidden on landscape works such as Andromeda Adrasteo). Tiles are now a 2:3 frame with the whole image contained on the page colour.
- Lightbox showed images cropped to a 9:16 frame. It now shows the whole image at full screen size.
- Lightbox additions: swipe between images on touch (and drag with a mouse), page scroll locked while open (smooth scroll paused too), keyboard focus kept inside the viewer and returned to the tile on close, image counter "n / N", neighbouring images preloaded, tap outside the image closes.
- Repeated gallery images removed: BROKEN, KABOOM! and Loosing Myself in YOU listed the same photo twice (in the grid, the lightbox and the ticker).
- Next/previous work thumbnails were cropped from the top (up to 46% hidden); they now show the whole piece.
- Ticker: with only one image (In Lucem works) the strip ran out and left an empty gap; it now repeats images until the strip always fills the screen. It also pauses when off screen or in a background tab, and shows a plain scrollable row when the visitor prefers reduced motion.
- Andromeda and Fragments works: the "Material" links (e.g. Bronze, Wax) were near white on the light page and almost invisible. They now use the dark text colour with an underline.
- Empty rich text paragraphs that held only "&nbsp;" (Damaged) no longer add blank gaps.
