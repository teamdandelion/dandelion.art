# Library

A catalogue of the books on the five-column built-in bookcase, plus the plan for reorganizing it.

- `books.json` is the catalogue and the plan: every shelf with its size, and every book with where it is now and where it is planned to go.
- This README explains the shelf numbering, how the bookcase is laid out, and the organizing plan.
- The site page `/library` (`src/pages/library.astro`) draws the bookcase to scale from `books.json`. It shows the current layout or the plan, how full each shelf is, and the titles on a shelf when you tap it. The page is unlisted and marked `noindex`. Any branch push builds a Cloudflare preview, so the `library` branch shows it at `https://library-dandelion-art.teamdandelion.workers.dev/library/`.

The catalogue is built from shelf photos taken on 2026-11-08.

## Shelf coordinates

Shelf IDs are `c<column>-r<row>`. Columns are numbered 1–5 from left to right, and rows are numbered from the top down within each column. Columns have different numbers of rows, and rows are not aligned across columns. The empty cubby above column 4's first row is `c4-top`.

Fixed spots:

- **Column 2, tall bottom bay (`c2-r4`):** the trilobite fossil stays here.
- **Column 4, tall bottom bay (`c4-r5`):** the ukulele stays here. It mirrors the fossil.
- **Column 3, glued-in shelf (`c3-r5`):** it can't be moved. Drilling holes for adjustable shelves is an open decision.

The shelf sizes in `books.json` are estimates from the whole-bookcase photo. The bookcase sits on a base cabinet of about 80 cm. Columns are about 66 cm wide, except column 3 at about 81 cm. A shelf whose base is above ~190 cm needs a step stool. A shelf based between ~120 and 190 cm is at eye level.

## How it is laid out now (2026-11-08)

| Column | What's there                                                                                                                                  |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | Orange print; life and matter plus history around the clock; history, then computing and math; organizations and investing; games and photos  |
| 2      | Empty bay where the blue print was; psychology and relationships with Palladium stacked flat; Buddhist, spiritual and philosophy; fossil      |
| 3      | Friend's books (moved from column 4) on the top two shelves; art books and the personal archive; objects on the fixed shelf; bust, mask, bowl |
| 4      | Top rows not photographed since the reshuffle; sci-fi on the two shelves above the ukulele                                                    |
| 5      | Blue print; mixed fiction, some lying flat; Kushiel's Dart, Sanderson, Rothfuss; dated journals and piano music; glassware                    |

## The plan (proposed)

### Each column has a theme

| Column | Theme                               | Shelves, top to bottom                                                                                 |
| ------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 1      | Science and making                  | Orange print · **core science (eye level)** · math and computing · business · games and photos         |
| 2      | Spirit and society                  | History and society · personal growth · **Dharma core (eye level)** · fossil                           |
| 3      | Center: friend, archive, ideas, art | Friend's books ×2 · archive and periodicals · philosophy and art · coffee-table art · bust, mask, bowl |
| 4      | Speculative fiction                 | Fantasy II · fantasy I · sci-fi II · sci-fi I · **favorites (eye level)** · ukulele                    |
| 5      | Fiction and poetry                  | Blue print · other fiction A–L · **other fiction M–Z (eye level)** · poetry and plays · glassware      |

- **Eye level is prime real estate.** Each column puts its core books there: core science in column 1, the Dharma core (Yung Pueblo, the Buddhist books) in column 2, and favorites in column 4.
- **Reach decides what goes high.** Things pulled rarely, or that guests shouldn't browse, go up: the friend's books, Palladium, and the personal archive (journals, yearbooks, notebooks).
- **The friend's books stay on the top two center shelves.** Some may be absorbed into the collection, since they aren't likely to be collected.
- **Philosophy sits in the center beside the art books**, between the spiritual column and the fiction.

### Ordering within each section

- **Fiction: bookstore style.** Sort by author, keeping each series together in reading order.
- **Nonfiction: a topic gradient within each column.** Column 1 runs life and matter → systems → math → computing → business. Column 2 runs history and society → psychology and personal growth → the contemplative core.

### Decisions

`books.json` (`decisions`) holds the current list, which the page also shows. Open now:

- Which sci-fi and fantasy favorites go at eye level (`c4-r4`). The Expanse is a placeholder.
- Whether to absorb some of the friend's books.
- Whether to drill holes in the center bay for adjustable shelves.
- Where the bottles go now that the blue print is on `c5-r1`.

## Data format

`books.json` has these parts:

- `case`: overall dimensions: base cabinet height, board thickness, column widths, and the width of one paperback (`paperbackCm`).
- `themes`: the theme of each column in the plan.
- `shelves`: one entry per shelf, with `id`, `column`, `row` and a short `contents` summary of what is there now. `bayCm` is the bay's height including the board under it. `objects` names the non-book things drawn on the shelf now. `plan` has the planned `label`, `intent` and `objects`.
- `books`: one entry per item, in left-to-right order on its current shelf. Each has `title`, `author` (`null` if unknown), `shelf` (`null` if it wasn't seen in the latest photos) and `section`. Optional fields:
  - `series` and `seriesNo`
  - `notes`
  - `heightCm`, for tall items
  - `count`, for an entry that stands for several items
  - `size`, the width in paperback widths (default 1)
  - `kind`: `personal`, `music`, `game`, `magazine` or `friend`, for items that aren't regular books
- `planShelf` and `planOrder` on each item: where it goes in the proposed layout, and its position from the left.
- `sections`: the subject sections.
- `decisions` and `planStatus`: the questions and whether the plan is decided.
- `updated`: the date of the last change.

Sizes and heights are estimates. Correct them with tape-measure numbers.

Books whose spines couldn't be read are entered as `Unidentified (…)`, with where they sit.

When books move, update their `shelf` field and order, and keep `shelves[].contents` accurate.
