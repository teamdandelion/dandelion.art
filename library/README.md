# Library

A catalogue of the books on the five-column built-in bookcase, plus the plan for reorganizing it.

- `books.json` is the catalogue: every shelf, and every book on it in left-to-right order.
- This README explains the shelf numbering, how the bookcase is laid out now, and the organizing plan.
- `shelves.html` draws the bookcase from `books.json`: the current layout or the plan, a count and fill estimate per shelf, and the titles on a shelf when you tap it. Serve the folder (`python3 -m http.server` in `library/`) and open `shelves.html`. A copy is published as a private claude.ai artifact.

The catalogue started from photos taken on 2026-11-08. It is not linked from the website yet.

## Shelf coordinates

Shelf IDs are `c<column>-r<row>`. Columns are numbered 1–5 from left to right, and rows are numbered from the top down within each column. Columns have different numbers of rows, and rows are not aligned across columns. Column 3's three empty high shelves are `c3-r1` to `c3-r3`. The empty cubby above column 4's first row is `c4-top`.

Four spots are fixed:

- **Column 2, tall bottom bay:** the fossil stays here.
- **Column 4, tall bottom bay:** the ukulele stays here. It mirrors the fossil.
- **Column 3, glued-in shelf:** it sits too low for the fossil. It is left alone, so no structural changes.
- **Column 3, top:** three empty shelves (`c3-r1` to `c3-r3`), originally planned around a TV that will not be installed.

The shelf sizes in `books.json` are estimates from the whole-bookcase photo. The bookcase sits on an ~80 cm base cabinet; columns are about 66 cm wide, except column 3 at about 81 cm. Anything with its base above ~190 cm needs a step stool.

## How it is laid out now

| Column | What's there                                                                                                                                                    |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | Orange-framed print; _The Culture: The Drawings_ and Palladium 1–19; clock, Klimt puzzle, Splendor games; mixed nonfiction; photos                              |
| 2      | Blue-framed print; sci-fi paperbacks; fossil                                                                                                                    |
| 3      | Empty high shelves; art books, yearbooks, notebooks; objects on the fixed shelf; bust, mask, bowl                                                               |
| 4      | Rows 1–3 hold a friend's books, kept here for them and not catalogued one by one. Row 4 holds Buddhism, spirituality and psychology. Ukulele in the bottom bay. |
| 5      | Bottles; Sanderson and Rothfuss; mixed sci-fi, fantasy and fiction; dated journals and piano music; glassware                                                   |

## The plan (proposed, not decided yet)

### Layout: make it symmetrical

The fossil and the ukulele already mirror each other at the bottom. The top is lopsided: both prints are on the left and the center is empty. The plan:

|               | Col 1                         | Col 2         | Col 3               | Col 4                       | Col 5            |
| ------------- | ----------------------------- | ------------- | ------------------- | --------------------------- | ---------------- |
| **High**      | Orange print                  | Empty bay     | Friend's books (×3) | Personal archive; Palladium | Blue print       |
| **Eye level** | Nonfiction I–II               | Nonfiction IV | Art books; objects  | Sci-fi; fantasy             | Fantasy; fiction |
| **Low**       | Nonfiction III; games, photos | Fossil        | Bust, mask, bowl    | Ukulele                     | Bar + glassware  |

- **Reach decides what goes high.** Things pulled rarely, or that guests shouldn't browse, go up: the friend's books, Palladium, and the personal archive (journals, yearbooks, notebooks). The Dharma books sit at eye level.
- **The friend's books go in the empty center top.** They are high and hard to reach, which suits books kept for someone else. A full row of spines also fills the space the TV left.
- **The prints go at the two outer ends.** The blue print moves from column 2 to column 5, and column 2's top gets shelves.
- **The bottles move down with the glassware** in the lower part of column 5.
- **The personal archive goes in `c4-top`** and Palladium in `c4-r1`, both high. `c3-r4` holds the art books and _The Culture: The Drawings_.
- **Column 2's print bay is left empty** once the print moves. It has room for three new shelves, all above reach.
- **Nonfiction on the left, fiction on the right.**

### Ordering within each section

- **Fiction: bookstore style.** Sort by subgenre (sci-fi, then fantasy, then other fiction), then by author. Each series stays together in reading order. Most of the fiction is series, so finding a book quickly matters most.
- **Nonfiction: a topic gradient.** At about 65 books, alphabetical order by author tells you nothing. The shelf instead runs as one line of thought:

  > life and matter → systems → deep history → political economy → organizations and decisions → time and creativity → psychology and relationships → contemplative and Buddhist

  The contemplative end sits next to the center archive.

### Open decisions

1. ~~Is it OK to move the column 2 print to column 5?~~ **Decided: yes.** Column 2's top gets shelving.
2. Where do Palladium and the board games go: the left side, or the center archive?
3. Do the friend's roughly three shelves of books fit on the center-top shelves?
4. Three novels are on the spiritual shelf: _It Can't Happen Here_, _The Archer_ and _The Alchemist_. They should move to fiction.

## Data format

`books.json` has these parts:

- `case`: overall dimensions: base cabinet height, board thickness, column widths, and the width of one paperback (`paperbackCm`).
- `shelves`: one entry per shelf, with `id`, `column`, `row` and a short `contents` summary of what is there now. `bayCm` is the bay's height including the board under it. `objects` names the non-book things drawn on the shelf now; `plan` has the planned `label`, `intent` and `objects`.
- `books`: one entry per item, in left-to-right order on its current shelf. Each has `title`, `author` (`null` if unknown), `shelf` and `section`. Optional fields: `series`, `seriesNo`, `notes`, `heightCm` (for tall items), `count` (for an entry that stands for several items), `size` (width in paperback widths, default 1), and `kind` (`personal`, `music`, `game` or `friend` for items that aren't regular books).
- `planShelf` and `planOrder` on each item: where it goes in the proposed layout, and its position from the left.
- `sections`: the subject sections in shelf order. Nonfiction runs as the topic gradient.
- `decisions` and `planStatus`: the open questions and whether the plan is decided.
- `updated`: the date of the last change.

Sizes and heights are estimates. Correct them with tape-measure numbers.

Books whose spines couldn't be read are entered as `Unidentified (…)` with a note. Columns 4 (row 4) and 5 (row 3) each have a placeholder entry for spines that need a closer photo.

When books move, update their `shelf` field and order, and keep `shelves[].contents` accurate.
