import { findFingerings, makeChord, SIX_STRING_BARITONE } from "./index.ts";

export const CHEAT_SHEET_COLUMNS = [
  { quality: "major", label: "Major" },
  { quality: "minor", label: "Minor" },
  { quality: "7", label: "Seventh" },
] as const;

export const CHEAT_SHEET_ROWS = ["C", "D", "E", "F", "G", "A", "B"].map(
  (root) => ({
    root,
    entries: CHEAT_SHEET_COLUMNS.map(({ quality }) => {
      const chord = makeChord(root, quality);
      return {
        chord,
        fingering: findFingerings(chord, SIX_STRING_BARITONE)[0],
        href: `/music/chords?chord=${encodeURIComponent(chord.symbol)}`,
      };
    }),
  }),
);
