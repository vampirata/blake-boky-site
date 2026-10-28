# Fixes: collections index and collection pages

- /collections: the "Andromeda Collection" card linked to /collections/coming-soon-blake; it now goes to /collections/andromeda (same fix in the "In the meantime" grids).
- /collections and coming soon grids: card images were cropped up to 59% (square at desktop, 9:16 at tablet and phone). Cards now use a 4:5 frame with the whole image contained on the page colour.
- Collection pages: work cards were 9:16 cover frames that cut wing tips and bases. They now use a 2:3 frame with the artwork contained on stone #5c5852 (hover zoom kept).
- Collection pages: feature images were cover cropped (up to 44%). Desktop and tablet keep the live row layout (2 up, then 3 up or full width) with every image contained on stone.
- Collection pages, phone: the row of 3 overflowed off screen (x = -50) and the row of 2 was hidden. All feature images now stack full width at their own ratio.
- Collection pages, tablet: the feature images were missing entirely on the live site; they are now shown in the desktop rows.
- Collection pages, desktop: the intro text, meta row, works heading and search touched the left edge of the window (0px gutter). They now sit on the 32px gutter used at tablet; images and the works grid stay full bleed.
- Collection pages: empty meta fields (for example SIZE on Spirit Collection and Andromeda) showed a label with no value. Empty fields are now left out.
- Spirit Collection intro: an unfinished placeholder ("... and continued into ect;;;") was cut back to "The collaborative process started in 2011 with Angel NUMBER 1." Ask the client for the rest of the sentence.
- Works search: ported from the WorksSearchGrid component, now listing works from works.json so every card links to a real work page, with a piece count and a "No pieces match your search." state. Without JavaScript the search bar is hidden and every card shows.
- Coming soon pages: "Collections you can see now" also listed collections that are themselves in preparation (Silentium Aurum, The Figures, Public Installations), linking back to coming soon pages. They are left out, leaving the 8 published collections.
- Coming soon pages: the plate image was cropped by up to 63% at tablet and phone. It is now contained (desktop frame kept) and shown at its own ratio on tablet and phone.
- Coming soon pages: page titles were "Coming Soon — Blake Ward"; now "Coming Soon: Blake Ward" (no dashes).
- Coming Soon Boky used the grey desktop nav on the live site while Coming Soon Blake used the light one; both now use the light nav on the paper background.

Flagged for the client:
- "Rethink Collection" card links to /collections/in-lucem on the live site. There is no Rethink collection page, so the link is kept; confirm where it should go.
