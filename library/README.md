# Library

A catalogue of the books on the five-column built-in bookcase, plus the plan for reorganizing it.

- `books.json` is the catalogue: every shelf, and every book on it in left-to-right order.
- This README explains the shelf numbering, how the bookcase is laid out now, and the organizing plan.

The catalogue started from photos taken on 2026-11-08. It is not linked from the website yet.

## Shelf coordinates

Shelf IDs are `c<column>-r<row>`. Columns are numbered 1–5 from left to right, and rows are numbered from the top down within each column. Columns have different numbers of rows, and rows are not aligned across columns. The center column's group of empty high shelves is a single entry, `c3-top`.

Four spots are fixed:

- **Column 2, tall bottom bay:** the fossil stays here.
- **Column 4, tall bottom bay:** the ukulele stays here. It mirrors the fossil.
- **Column 3, glued-in shelf:** it sits too low for the fossil. It is left alone, so no structural changes.
- **Column 3, top:** three or four empty shelves, originally planned around a TV that will not be installed.

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

|            | Col 1         | Col 2      | Col 3            | Col 4   | Col 5           |
| ---------- | ------------- | ---------- | ---------------- | ------- | --------------- |
| **Top**    | Orange print  | Shelving   | Friend's books   | Fiction | Blue print      |
| **Middle** | Nonfiction    | Nonfiction | Personal archive | Fiction | Fiction         |
| **Bottom** | Games, photos | Fossil     | Bust, mask, bowl | Ukulele | Bar + glassware |

- **The friend's books go in the empty center top.** They are high and hard to reach, which suits books kept for someone else. A full row of spines also fills the space the TV left.
- **The prints go at the two outer ends.** The blue print moves from column 2 to column 5, and column 2's top gets shelves.
- **The bottles move down with the glassware** in the lower part of column 5.
- **Column 3, row 4 becomes the personal archive:** yearbooks, childhood books, dated journals, notebooks and art books.
- **Nonfiction on the left, fiction on the right.**

### Ordering within each section

- **Fiction: bookstore style.** Sort by subgenre (sci-fi, then fantasy, then other fiction), then by author. Each series stays together in reading order. Most of the fiction is series, so finding a book quickly matters most.
- **Nonfiction: a topic gradient.** At about 65 books, alphabetical order by author tells you nothing. The shelf instead runs as one line of thought:

  > life and matter → systems → deep history → political economy → organizations and decisions → time and creativity → psychology and relationships → contemplative and Buddhist

  The contemplative end sits next to the center archive.

### Open decisions

1. Is it OK to move the column 2 print to column 5?
2. Where do Palladium and the board games go: the left side, or the center archive?
3. Do the friend's roughly three shelves of books fit on the center-top shelves?
4. Three novels are on the spiritual shelf: _It Can't Happen Here_, _The Archer_ and _The Alchemist_. They should move to fiction.

## Data format

`books.json` has three parts:

- `shelves`: one entry per shelf, with `id`, `column`, `row` and a short `contents` summary.
- `books`: one entry per book, in left-to-right order. Each has `title`, `author` (`null` if unknown) and `shelf`. Optional fields: `series`, `notes`, and `kind` (`personal` or `music` for items that aren't regular books).
- `updated`: the date of the last change.

Books whose spines couldn't be read are entered as `Unidentified (…)` with a note. Columns 4 (row 4) and 5 (row 3) each have a placeholder entry for spines that need a closer photo.

When books move, update their `shelf` field and order, and keep `shelves[].contents` accurate.
