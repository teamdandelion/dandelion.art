# Palette experiments

Edit `src/lib/palettes.ts` to tune a palette or add another. Each has independent light/dark colors for page, surface, panel, raised controls, text, muted text, border, accent, soft accent, text on accent, and secondary accent. `DEFAULT_PALETTE` is the starting choice, currently Gallery for this experiment.

`PaletteHead.astro` emits CSS and applies validated URL or saved preferences before paint. `src/styles/palette.css` maps the roles to DaisyUI; the music styles map their existing `--ca-*` roles to the same values. Components should not invent their own palette. Piano black/white keys and chord-family colors preserve their semantic meaning. Artwork pixels, the QQL viewing backdrop, and Polysome’s full-screen artwork presentation are deliberately independent of the site palette.

Open `/design/palettes/` for paired light/dark samples and links to real pages. `?palette=tide&theme=dark&paletteReview=1` opens a reproducible review. The review bar follows navigation within that browser session, switches colors without resetting tools, and copies the current page with its palette and mode. Hide it with ×; return to the lab to reopen it. Normal visits have no review bar. Palette and light/dark preferences are saved locally; explicit URL settings override them.

Run `npm run test:palettes`. The tests check readable text and accent combinations against the WCAG 2.x 4.5:1 threshold; they are token regression tests, not a claim of full-page accessibility conformance. See [W3C’s contrast guidance](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum).

The experiment intentionally leaves typography and layout alone to make color comparisons useful. No final palette has been chosen.
