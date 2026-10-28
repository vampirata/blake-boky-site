# Fixes: galleries, gallery detail, contact

- Galleries, Gallery Partners grid: square frames kept, but each gallery photo is now contained on paper instead of cropped (live cut 22 to 33% off the portrait photos, e.g. Petley Jones and Hilton Contemporary).
- Galleries, Installation Views: images show at their own ratio (live cropped them into fixed boxes, e.g. 432x258 for a 4:3 photo). Tablet keeps the live two-column arrangement (1 and 3 left, 2 right).
- Galleries, Exhibition banners: kept as cover crops (all three sources are landscape panoramas). A portrait source added later is shown whole instead of cropped into the strip.
- Gallery detail, image block: the live "Image Fill" cut a portrait sculpture into a wide strip (up to 71% lost). It now shows the whole image at its own ratio, max height 80vh, centred on paper.
- Gallery detail, "Visit gallery website": live linked each gallery page back to itself. It now links to the gallery's real external site from the data (Zurich Art Salon: maisondartgallery.com, Hilton Contemporary: hiltoncontemporary.com), opening in a new tab. The template label "Additional link" is no longer shown.
- Gallery detail, "Visit gallery website" hidden on Art Fairs and Salons and Petley Jones: the data has no external URL for them. Needs a URL from the client.
- Gallery detail, Petley Jones: placeholder body text "hhh" hidden (and the then empty info section with it). Needs real copy from the client.
- Gallery detail, empty `<p><br></p>` spacer paragraphs from the CMS dropped (Art Fairs and Salons started with one).
- Gallery detail, SEO title: live was the unfilled template "{{Title}} — Blake & Boky". Now uses the gallery title, e.g. "Petley Jones | Blake & Boky".
- Gallery detail, back pill: live used the dark pill at tablet and phone widths on a paper page. Now the light pill at every width.
- Galleries index, SEO title "Petley Jones Gallery — Blake & Boky" now goes through the shared title format ("Petley Jones Gallery | Blake & Boky").
- Contact, portrait: shown whole at its own ratio on phone (live cropped it to 3:2, cutting 16% off the height).
- Contact, form: posts with fetch to the Framer Forms endpoint (one constant, FORM_ENDPOINT, at the top of src/pages/contact.astro) with native validation, inline success and error states, and on failure an error that links to both artists' email addresses. One hidden honeypot field (website) replaces Framer's eleven.
- Contact, "Piece interested in" select: the 48 works are grouped under their collections (Fragments, Andromeda, Spirit Collection, In Lucem, Figurative Poetry) as optgroups, as in the Framer data.
