import { practiceSheet, type SheetEntry, sheetEntry } from "./cheat-sheet.ts";
import {
  type Chord,
  type FrettedInstrument,
  formatNote,
  type Key,
  keyChords,
  keyContext,
  makeChord,
} from "./index.ts";

export type ExplorationEntry = SheetEntry & {
  relationship: string;
  progression?: string;
};
export type ExplorationSection = {
  id: string;
  title: string;
  description: string;
  entries: ExplorationEntry[];
};

/** Editorial learning sequence, not a claim of universal harmonic popularity. */
export function explorationSections(
  key: Key,
  instrument: FrettedInstrument,
): ExplorationSection[] {
  const triads = keyChords(key);
  const home = triads[0].chord.symbol;
  const seen = new Set<string>();
  const entry = (
    chord: Chord,
    relationship: string,
    progression?: string,
  ): ExplorationEntry => ({
    ...sheetEntry(chord, instrument),
    relationship,
    progression,
  });
  const section = (
    id: string,
    title: string,
    description: string,
    entries: ExplorationEntry[],
  ): ExplorationSection => ({
    id,
    title,
    description,
    entries: entries.filter(({ chord }) => {
      if (seen.has(chord.id)) return false;
      seen.add(chord.id);
      return true;
    }),
  });
  const basics = triads.map(({ chord, roman }) => entry(chord, roman));
  if (key.mode === "natural-minor") {
    for (const quality of ["major", "7"] as const) {
      const chord = makeChord(triads[4].chord.root, quality);
      basics.push(
        entry(chord, "Raised leading tone", `${chord.symbol} → ${home}`),
      );
    }
  }
  const colors = [0, 4, 3, 5, 1, 2, 6].flatMap((degree) =>
    (["sus2", "sus4", "add9", "6", "m6"] as const)
      .map((quality) => makeChord(triads[degree].chord.root, quality))
      .filter((chord) => keyContext(chord, key).fitsPitchClasses)
      .map((chord) =>
        entry(
          chord,
          "In-key color",
          `${chord.symbol} → ${triads[degree].chord.symbol}`,
        ),
      ),
  );
  const nearby = practiceSheet(
    formatNote(key.tonic),
    instrument,
    key.mode,
  ).nearby;
  const parallel = keyChords({
    ...key,
    mode: key.mode === "major" ? "natural-minor" : "major",
  });
  const borrowed = [3, 6, 5, 2, 0]
    .map((degree) => parallel[degree].chord)
    .filter((chord) => !keyContext(chord, key).fitsPitchClasses)
    .map((chord) =>
      entry(
        chord,
        `From parallel ${key.mode === "major" ? "minor" : "major"}`,
        `${chord.symbol} → ${home}`,
      ),
    );
  return [
    section(
      "home",
      "Your key",
      "Start with the seven triads. Find a shape, then try a change.",
      basics,
    ),
    section(
      "sevenths",
      "Add sevenths",
      "The same roots, with another note of color.",
      keyChords(key, true).map(({ chord, roman }) => entry(chord, roman)),
    ),
    section(
      "colors",
      "Change the color",
      "Suspensions and added notes, still inside your scale.",
      colors,
    ),
    section(
      "pull",
      "Pull toward another chord",
      "One outside note can point somewhere familiar. Try the destination.",
      nearby
        .filter((e) => e.kind === "applied")
        .map((e) => entry(e.chord, e.roman, `${e.chord.symbol} ${e.move}`)),
    ),
    section(
      "borrow",
      "Borrow a different mood",
      "Colors from the parallel key. These moves are invitations, not rules.",
      borrowed,
    ),
  ].filter((s) => s.entries.length > 0);
}
