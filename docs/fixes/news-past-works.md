# Fixes: news and past works

- News index, news article, past works index and past work detail: page titles are now the clean item title ("News", "Past Works", "<Article title>", "<Work title>") followed by the site name, instead of the Framer SEO strings.
- Past work detail: all 13 pages shared the same title and description ("Past Works, Boky Hackel-Ward" / "From the archive of Boky Hackel-Ward."). Each page now has its own title and a description built from its title, medium and year.
- News cards: square frames now contain the whole press image on the page colour (live cut 10 to 29% of the sides). The grid rhythm (350 / 385 / 360 squares) is unchanged.
- Past works cards: square frames now contain the whole work on #0f0f0f (live cut up to 44%, heads and bases of sculptures). Grid rhythm kept.
- Past work detail hero: shown whole at the image's own ratio, never taller than 80vh (live cut 55% of the square photos into a 1376x620 strip, faces included).
- Past work detail: the fixed back pill covered the "Boky Hackel-Ward" eyebrow on every width. The header now starts 26px lower so the eyebrow clears the pill.
- Past work detail, Chicago Interview and Press Document: no hero image is set in the CMS. The live page left an empty 620px placeholder; the rebuild drops the frame so there is no gap.
- Press Document: "View original" now opens the archived copy of the PDF on this site (`/assets/past-works/ccee0b_3e52acd46b8048f0b400f0050ed484e2.pdf`) in a new tab, instead of relying on the old bokysculpture.com file link.
- Past work detail, Ich und Es: the two inline portrait images were cut to 448x300 landscape strips. They now show whole, side by side.
- Past work detail: "View original" links open in a new tab (`target="_blank" rel="noopener"`).
- News article: the empty subheading in "Pietrasanta, understanding the poetry of space" (`<h3><br></h3>`) is rendered as a blank spacer line, not an empty heading.
- News article previous/next thumbs: shown whole (contained) when a photo's ratio differs by more than 12% from the 122x150 frame; near-matching photos keep the live cover crop.
- News index, news article and past works index: the Arrive title renders in Inter 300 26px as on the live site (the shared ArriveHeader defaults to the Cormorant H2 role), and the hairline under it is #363636 on the paper article page as live.

## For the client (kept verbatim, please confirm)

- Every news item is dated Nov 24, 2025 on the live site, so they all show the same date. Kept as is. Please send the real publication dates.
- Chicago Interview: the body still contains the editor note "Video pending upload, add the hosted link to the Video URL field once the file has been transcoded and uploaded." Kept as is, but it reads as an internal instruction on a public page. Please send the video link or approve removing the note.
- Spellings kept verbatim, please confirm: "Sculptures Symbolisiing Hope", "Fontveille" (Fontvieille), "Les Atlantes 1004", and the article slug "when-walls-become-words-buildings-as-silent-storytellers" for the Invoco Te Divina Stella interview (a template leftover in the URL; changing it would break existing links, so it stays).
