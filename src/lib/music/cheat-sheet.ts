import {
  type Chord,
  type ChordQuality,
  findFingerings,
  type Key,
  keyChords,
  makeChord,
  parseNote,
  SIX_STRING_BARITONE,
  transpose,
} from "./index.ts";

export function sheetEntry(chord: Chord) {
  return {
    chord,
    fingering: findFingerings(chord, SIX_STRING_BARITONE)[0],
    href: `/music/chords?chord=${encodeURIComponent(chord.symbol)}`,
  };
}
export type SheetEntry = ReturnType<typeof sheetEntry>;

export const CHEAT_SHEET_COLUMNS = [
  { quality: "major", label: "Major" },
  { quality: "minor", label: "Minor" },
  { quality: "7", label: "Seventh" },
] as const;

export const CHROMATIC_ROOTS = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];
export const ROOT_ALIASES: Record<string, string> = {
  Db: "C♯ / D♭",
  Eb: "D♯ / E♭",
  Gb: "F♯ / G♭",
  Ab: "G♯ / A♭",
  Bb: "A♯ / B♭",
};

export function allChordRows(quality: ChordQuality | "common" = "common") {
  return CHROMATIC_ROOTS.map((root) => ({
    root,
    entries: (quality === "common"
      ? CHEAT_SHEET_COLUMNS.map((column) => column.quality)
      : [quality]
    ).map((quality) => sheetEntry(makeChord(root, quality))),
  }));
}

export function practiceSheet(tonic: string) {
  const key: Key = { tonic: parseNote(tonic), mode: "major" };
  const triads = keyChords(key);
  const sevenths = keyChords(key, true);
  const rows = triads.map((item, index) => ({
    degree: item.degree,
    roman: item.roman,
    entries: [sheetEntry(item.chord), sheetEntry(sevenths[index].chord)],
  }));
  // A deliberately small practice vocabulary, not a universal ranking of harmony.
  const applied = [4, 5, 1, 3].map((index) => {
    const target = triads[index];
    const root = transpose(target.chord.root, {
      degree: 5,
      semitones: 7,
      label: "5",
    });
    return {
      ...sheetEntry(makeChord(root, "7")),
      roman: `V7/${target.roman}`,
      move: `→ ${target.chord.symbol}`,
      kind: "applied" as const,
    };
  });
  const home = triads[0].chord.symbol;
  const fourth = triads[3].chord.symbol;
  const borrowed = [
    {
      ...sheetEntry(makeChord(triads[3].chord.root, "minor")),
      roman: "iv",
      move: `→ ${home}`,
      kind: "borrowed" as const,
    },
    {
      ...sheetEntry(
        makeChord(
          transpose(key.tonic, { degree: 7, semitones: 10, label: "♭7" }),
          "major",
        ),
      ),
      roman: "♭VII",
      move: `→ ${fourth} → ${home}`,
      kind: "borrowed" as const,
    },
  ];
  const symbol = (i: number) => triads[i].chord.symbol;
  const dominant = sevenths[4].chord.symbol;
  const loops = [
    [home, fourth, dominant, home],
    [home, symbol(5), symbol(1), dominant, home],
    [home, applied[1].chord.symbol, symbol(5), fourth, dominant, home],
  ];
  return { key, rows, nearby: [...applied, ...borrowed], loops };
}
