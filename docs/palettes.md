# Palette experiments

## Site palette: Iris

Iris is the site-wide default. Light mode uses `#EBECFC` page backgrounds, `#E0D1FF` lavender headers, navy type, and `#5369CF` blue note fills. Dark mode uses `#1C1B1B` charcoal, `#322D52` violet headers, and a lighter blue for clear markers. Cards, settings, selections, links, and controls share the same semantic roles across the site.

Dedicated `diagramLine` and `diagramNut` roles separate muted lavender fret/string structure from blue playable markers. The nut is stronger than the grid. Grid and marker contrast is tested at 3:1 against diagram surfaces; text and labels at 4.5:1. Piano keys, chord-family distinctions, and artwork retain their existing meanings.

The palette preference key is now `site.palette.v2` so earlier saved experiments do not mask the new default. The independent light/dark preference is unchanged. Explicit preview URLs and newly selected lab presets still override the default. The earlier experiments below remain in the unlisted lab.

The earlier Tide experiments pair teal and tangerine. **Tide** uses luminous teal (`#68E5D5`) and tangerine (`#FFB15C`) against deep petrol at night, and deeper accents against pale sea-glass by day. Light-mode text colors are darker relatives to preserve legibility, not literal copies of the bright dark-mode accents.

Three Tide variations inherit its roles: **Bright** changes only the accents and soft highlight; **Sunlit** pairs warm cream light surfaces with Bright’s cooler dark foundation and the selected teal/tangerine pair; **Surf** adds a stronger sea-glass tint with electric teal and coral-tangerine. **Zest** retains the user’s original soft cyan (`#A9FFF7`) and tangerine (`#FF9B71`) for comparison. All variants retain the same contrast requirements.

Edit `src/lib/palettes.ts` to tune a palette or add another. Each has independent light/dark colors for page, surface, panel, raised controls, text, muted text, border, accent, soft accent, text on accent, and secondary accent. `DEFAULT_PALETTE` is the single starting choice used by the server-rendered page and browser controls. Obsolete saved palette IDs fall back to this default.

`PaletteHead.astro` emits CSS and applies validated URL or saved preferences before paint. `src/styles/palette.css` maps the roles to DaisyUI; the music styles map their existing `--ca-*` roles to the same values. Components should not invent their own palette. Piano black/white keys and chord-family colors preserve their semantic meaning. Artwork pixels, the QQL viewing backdrop, and Polysome’s full-screen artwork presentation are deliberately independent of the site palette.

Open `/design/palettes/` for paired light/dark samples and links to real pages. `?palette=tide&theme=dark&paletteReview=1` opens a reproducible review. The review bar follows navigation within that browser session, switches colors without resetting tools, and copies the current page with its palette and mode. Hide it with ×; return to the lab to reopen it. Normal visits have no review bar. Palette and light/dark preferences are saved locally; explicit URL settings override them.

Run `npm run test:palettes`. The tests check readable text and accent combinations against the WCAG 2.x 4.5:1 threshold; they are token regression tests, not a claim of full-page accessibility conformance. See [W3C’s contrast guidance](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum).

The palette implementation leaves typography and layout alone; Iris is the selected default, with earlier experiments retained for comparison.

## Sunlit tuner

Sunlit’s selected baseline is teal `#A8EAE0` and tangerine `#FFA647`, identical in both modes. Its warm light surfaces are unchanged; the dark surfaces, text, borders, and soft highlight match Tide Bright. Separate `accentFill` / `secondaryFill` roles drive colored shapes and controls; `accent` / `secondary` are contrast-adjusted text shades. `onAccent` and `onSecondary` select readable labels independently. Other presets are preserved.

Tangerine is Sunlit’s primary foreground accent: chord fingering dots, primary actions, and links. Teal is the secondary accent and supports selected-state backgrounds and headers. The dedicated `header` role gives light-mode site and cheat-sheet headers a pale teal fill without recoloring the cream cards; dark headers retain the cooler teal surface. Atlas root-note markers use the secondary teal, with the legend matching that distinction. The reference cheat sheet keeps all finger markers in primary tangerine.

The Sunlit section in the lab has HSV sliders and numeric inputs. Both sample cards update together; actual-page preview links carry the tuned colors. Values persist under `site.sunlit-signature.v1` and can be shared with **Copy tuned link**. Valid six-digit `teal` and `tangerine` query parameters take precedence over saved values. Reset restores the selected baseline pair, not the other presets. Custom values never alter the committed palette or other visitors’ settings.

`palette-color.ts` contains conversion and contrast helpers. The tests cover HSV round trips, malformed colors, identical light/dark fills, and readable text/labels at extreme custom colors. A contrasting edge distinguishes bright fills from light surfaces; accent text remains a darker/lighter relative rather than promising every bright color works as small text.
